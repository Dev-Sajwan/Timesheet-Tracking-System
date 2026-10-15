using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebAPI.Filters;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITimesheetDbContext _context;

        public PermissionsController(IPermissionService permissionService, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ITimesheetDbContext context)
        {
            _permissionService = permissionService;
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        // ========== APIs ==========
        [HttpGet("apis")]
        public async Task<IActionResult> GetAllApis()
        {
            var apis = await _permissionService.GetAllApisAsync();
            return Ok(apis.Select(a => new { a.Id, a.Name, a.Description, a.Route, a.HttpMethod, a.Controller, a.IsSensitive }));
        }

        // ========== Permission Sets ==========
        [HttpGet("permission-sets")]
        public async Task<IActionResult> GetPermissionSets()
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            return Ok(sets.Select(s => new {
                s.Id,
                s.Name,
                s.Description,
                s.IsSystem,
                s.IsAssignable,
                s.CreatedAt,
                s.UpdatedAt,
                Apis = s.PermissionSetApis.Select(psa => new { psa.Api.Id, psa.Api.Name, psa.Api.Route, psa.Api.HttpMethod, psa.Api.Controller, psa.Api.IsSensitive })
            }));
        }

        public class PermissionSetCreateDto { public string Name { get; set; } public string Description { get; set; } public List<int> ApiIds { get; set; } }

        [HttpPost("permission-sets")]
        public async Task<IActionResult> CreatePermissionSet([FromBody] PermissionSetCreateDto dto)
        {
            var p = await _permissionService.CreatePermissionSetAsync(dto.Name, dto.Description, dto.ApiIds);
            return Ok(p);
        }

        [HttpPut("permission-sets/{id}")]
        public async Task<IActionResult> UpdatePermissionSet(int id, [FromBody] PermissionSetCreateDto dto)
        {
            var p = await _permissionService.UpdatePermissionSetAsync(id, dto.Name, dto.Description, dto.ApiIds);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpDelete("permission-sets/{id}")]
        public async Task<IActionResult> DeletePermissionSet(int id)
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            var set = sets.FirstOrDefault(s => s.Id == id);
            if (set?.IsSystem == true)
                return BadRequest(new { Message = "Cannot delete the system Admin permission set." });
            
            await _permissionService.DeletePermissionSetAsync(id);
            return Ok();
        }

        // ========== User Permission Set Assignments ==========
        [HttpGet("users/{userId}/permission-sets")]
        public async Task<IActionResult> GetUserPermissionSets(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var userPermissionSets = await _context.UserPermissionSets
                .Include(ups => ups.PermissionSet)
                    .ThenInclude(ps => ps.PermissionSetApis)
                        .ThenInclude(psa => psa.Api)
                .Where(ups => ups.UserId == userId)
                .ToListAsync();

            return Ok(userPermissionSets.Select(ups => new {
                ups.PermissionSet.Id,
                ups.PermissionSet.Name,
                ups.PermissionSet.Description,
                ups.PermissionSet.IsSystem,
                ups.PermissionSet.IsAssignable,
                ups.AssignedAt,
                ups.AssignedBy
            }));
        }

        [HttpPost("users/{userId}/permission-sets/{permissionSetId}")]
        public async Task<IActionResult> AssignPermissionSetToUser(string userId, int permissionSetId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var permissionSet = await _context.PermissionSets.FindAsync(permissionSetId);
            if (permissionSet == null) return NotFound(new { Message = "Permission set not found" });

            if (permissionSet.IsSystem)
                return BadRequest(new { Message = "Cannot assign the system Admin permission set directly." });

            // Check if already assigned
            var existing = await _context.UserPermissionSets
                .FirstOrDefaultAsync(ups => ups.UserId == userId && ups.PermissionSetId == permissionSetId);
            if (existing != null)
                return BadRequest(new { Message = "User already has this permission set" });

            var currentUserId = User.FindFirst("uid")?.Value ?? "system";
            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = permissionSetId,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = currentUserId
            };

            _context.UserPermissionSets.Add(userPermissionSet);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Permission set assigned successfully" });
        }

        [HttpDelete("users/{userId}/permission-sets/{permissionSetId}")]
        public async Task<IActionResult> UnassignPermissionSetFromUser(string userId, int permissionSetId)
        {
            var userPermissionSet = await _context.UserPermissionSets
                .FirstOrDefaultAsync(ups => ups.UserId == userId && ups.PermissionSetId == permissionSetId);
            
            if (userPermissionSet == null)
                return NotFound(new { Message = "User permission set assignment not found" });

            var permissionSet = await _context.PermissionSets.FindAsync(permissionSetId);
            if (permissionSet?.IsSystem == true)
                return BadRequest(new { Message = "Cannot unassign the system Admin permission set." });

            _context.UserPermissionSets.Remove(userPermissionSet);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Permission set unassigned successfully" });
        }

        // ========== Current User Permissions ==========
        [HttpGet("my-permissions")]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();
            
            var roles = await _userManager.GetRolesAsync(user);

            // Get permissions from user's assigned permission sets
            var perms = await _permissionService.GetUserPermissionsAsync(userId);
            
            // If user has Admin role, L1 role, or System Admin profile, they get all permissions
            var isSystemAdmin = User.FindFirst("isSystemAdmin")?.Value?.ToLower() == "true";
            if (roles.Contains("Admin") || roles.Contains("L1") || isSystemAdmin) {
                var allApis = await _permissionService.GetAllApisAsync();
                var allNames = allApis.Select(x => x.Name).ToList();
                perms = perms.Union(allNames).Distinct().ToList();
            }

            return Ok(perms);
        }
    }
}