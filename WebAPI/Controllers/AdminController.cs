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
    [Route("api/admin")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITimesheetDbContext _context;

        public AdminController(IPermissionService permissionService, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ITimesheetDbContext context)
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
                Apis = s.PermissionSetApis.Select(psa => new { psa.Api.Id, psa.Api.Name, psa.Api.Route, psa.Api.HttpMethod, psa.Api.Controller, psa.Api.IsSensitive }),
                ApiCount = s.PermissionSetApis.Count,
                UserCount = s.UserPermissionSets.Count
            }));
        }

        public class CreatePermissionSetDto { public string Name { get; set; } = string.Empty; public string Description { get; set; } = string.Empty; public List<int> ApiIds { get; set; } = new(); }

        [HttpPost("permission-sets")]
        public async Task<IActionResult> CreatePermissionSet([FromBody] CreatePermissionSetDto dto)
        {
            // Reject if trying to create Admin set
            if (dto.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { Message = "Cannot create a system Admin permission set." });
            
            // Reject if any sensitive APIs are included
            var sensitiveApis = await _context.Apis.Where(a => a.IsSensitive).Select(a => a.Id).ToListAsync();
            if (dto.ApiIds.Any(id => sensitiveApis.Contains(id)))
                return BadRequest(new { Message = "Cannot add sensitive APIs to permission sets." });
            
            var p = await _permissionService.CreatePermissionSetAsync(dto.Name, dto.Description, dto.ApiIds);
            return Ok(p);
        }

        [HttpPut("permission-sets/{id}")]
        public async Task<IActionResult> UpdatePermissionSet(int id, [FromBody] CreatePermissionSetDto dto)
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            var existingSet = sets.FirstOrDefault(s => s.Id == id);
            if (existingSet == null) return NotFound();
            if (existingSet.IsSystem)
                return BadRequest(new { Message = "Cannot edit the system Admin permission set." });
            
            // Reject if any sensitive APIs are included
            var sensitiveApis = await _context.Apis.Where(a => a.IsSensitive).Select(a => a.Id).ToListAsync();
            if (dto.ApiIds.Any(id => sensitiveApis.Contains(id)))
                return BadRequest(new { Message = "Cannot add sensitive APIs to permission sets." });
            
            var p = await _permissionService.UpdatePermissionSetAsync(id, dto.Name, dto.Description, dto.ApiIds);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpDelete("permission-sets/{id}")]
        public async Task<IActionResult> DeletePermissionSet(int id)
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            var set = sets.FirstOrDefault(s => s.Id == id);
            if (set == null) return NotFound();
            if (set.IsSystem)
                return BadRequest(new { Message = "Cannot delete the system Admin permission set." });
            
            await _permissionService.DeletePermissionSetAsync(id);
            return Ok();
        }

        [HttpPost("permission-sets/{id}/apis/{apiId}")]
        public async Task<IActionResult> AddApiToPermissionSet(int id, int apiId)
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            var set = sets.FirstOrDefault(s => s.Id == id);
            if (set == null) return NotFound();
            if (set.IsSystem)
                return BadRequest(new { Message = "Cannot modify the system Admin permission set." });
            
            var api = await _context.Apis.FindAsync(apiId);
            if (api == null) return NotFound();
            if (api.IsSensitive)
                return BadRequest(new { Message = "Cannot add sensitive APIs to permission sets." });
            
            var exists = set.PermissionSetApis.Any(psa => psa.ApiId == apiId);
            if (exists) return BadRequest(new { Message = "API already in permission set." });
            
            _context.PermissionSetApis.Add(new PermissionSetApi { PermissionSetId = id, ApiId = apiId });
            await _context.SaveChangesAsync();
            return Ok(new { Message = "API added successfully." });
        }

        [HttpDelete("permission-sets/{id}/apis/{apiId}")]
        public async Task<IActionResult> RemoveApiFromPermissionSet(int id, int apiId)
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            var set = sets.FirstOrDefault(s => s.Id == id);
            if (set == null) return NotFound();
            if (set.IsSystem)
                return BadRequest(new { Message = "Cannot modify the system Admin permission set." });
            
            var psa = await _context.PermissionSetApis.FirstOrDefaultAsync(x => x.PermissionSetId == id && x.ApiId == apiId);
            if (psa == null) return NotFound();
            
            _context.PermissionSetApis.Remove(psa);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "API removed successfully." });
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

        // ========== Roles ==========
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => new { id = r.Id, name = r.Name }).ToListAsync();
            return Ok(roles);
        }
    }
}