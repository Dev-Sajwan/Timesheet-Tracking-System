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

        // ========== Permissions ==========
        [HttpGet("permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions.Select(p => new { 
                p.Id, 
                p.Name, 
                p.Description, 
                p.IsSensitive,
                Apis = p.PermissionApis.Select(pa => new { pa.Api.Id, pa.Api.Name, pa.Api.Route, pa.Api.HttpMethod, pa.Api.Controller, pa.Api.IsSensitive })
            }));
        }

        public class PermissionCreateDto { public string Name { get; set; } public string Description { get; set; } public List<int> ApiIds { get; set; } public bool IsSensitive { get; set; } }

        [HttpPost("permissions")]
        public async Task<IActionResult> CreatePermission([FromBody] PermissionCreateDto dto)
        {
            var p = await _permissionService.CreatePermissionAsync(dto.Name, dto.Description, dto.ApiIds, dto.IsSensitive);
            return Ok(p);
        }

        [HttpPut("permissions/{id}")]
        public async Task<IActionResult> UpdatePermission(int id, [FromBody] PermissionCreateDto dto)
        {
            var p = await _permissionService.UpdatePermissionAsync(id, dto.Name, dto.Description, dto.ApiIds, dto.IsSensitive);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpDelete("permissions/{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            await _permissionService.DeletePermissionAsync(id);
            return Ok();
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
                Permissions = s.PermissionSetPermissions.Select(psp => new { 
                    psp.Permission.Id, 
                    psp.Permission.Name, 
                    psp.Permission.Description, 
                    psp.Permission.IsSensitive,
                    Apis = psp.Permission.PermissionApis.Select(pa => new { pa.Api.Id, pa.Api.Name, pa.Api.Route, pa.Api.HttpMethod, pa.Api.Controller, pa.Api.IsSensitive })
                })
            }));
        }

        public class PermissionSetCreateDto { public string Name { get; set; } public string Description { get; set; } public List<int> PermissionIds { get; set; } }

        [HttpPost("permission-sets")]
        public async Task<IActionResult> CreatePermissionSet([FromBody] PermissionSetCreateDto dto)
        {
            var p = await _permissionService.CreatePermissionSetAsync(dto.Name, dto.Description, dto.PermissionIds);
            return Ok(p);
        }

        [HttpPut("permission-sets/{id}")]
        public async Task<IActionResult> UpdatePermissionSet(int id, [FromBody] PermissionSetCreateDto dto)
        {
            var p = await _permissionService.UpdatePermissionSetAsync(id, dto.Name, dto.Description, dto.PermissionIds);
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

        // ========== User Permission Assignments ==========
        [HttpGet("users/{userId}/permissions")]
        public async Task<IActionResult> GetUserPermissions(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var userPermissions = await _context.UserPermissions
                .Include(up => up.Permission)
                    .ThenInclude(p => p.PermissionApis)
                        .ThenInclude(pa => pa.Api)
                .Where(up => up.UserId == userId)
                .ToListAsync();

            return Ok(userPermissions.Select(up => new {
                up.Permission.Id,
                up.Permission.Name,
                up.Permission.Description,
                up.Permission.IsSensitive,
                up.AssignedAt,
                up.AssignedBy,
                Apis = up.Permission.PermissionApis.Select(pa => new { pa.Api.Id, pa.Api.Name, pa.Api.Route, pa.Api.HttpMethod, pa.Api.Controller, pa.Api.IsSensitive })
            }));
        }

        public class UserPermissionAssignDto { public int PermissionId { get; set; } }

        [HttpPost("users/{userId}/permissions")]
        public async Task<IActionResult> AssignPermissionToUser(string userId, [FromBody] UserPermissionAssignDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var permission = await _context.Permissions.FindAsync(dto.PermissionId);
            if (permission == null) return NotFound(new { Message = "Permission not found" });

            var currentUserId = User.FindFirst("uid")?.Value ?? "system";
            await _permissionService.AssignPermissionToUserAsync(userId, dto.PermissionId, currentUserId);

            return Ok(new { Message = "Permission assigned successfully" });
        }

        [HttpDelete("users/{userId}/permissions/{permissionId}")]
        public async Task<IActionResult> UnassignPermissionFromUser(string userId, int permissionId)
        {
            await _permissionService.UnassignPermissionFromUserAsync(userId, permissionId);
            return Ok(new { Message = "Permission unassigned successfully" });
        }

        // ========== User Permission Set Assignments ==========
        [HttpGet("users/{userId}/permission-sets")]
        public async Task<IActionResult> GetUserPermissionSets(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var userPermissionSets = await _context.UserPermissionSets
                .Include(ups => ups.PermissionSet)
                    .ThenInclude(ps => ps.PermissionSetPermissions)
                        .ThenInclude(psp => psp.Permission)
                            .ThenInclude(p => p.PermissionApis)
                                .ThenInclude(pa => pa.Api)
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

        public class UserPermissionSetAssignDto { public int PermissionSetId { get; set; } }

        [HttpPost("users/{userId}/permission-sets")]
        public async Task<IActionResult> AssignPermissionSetToUser(string userId, [FromBody] UserPermissionSetAssignDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found" });

            var permissionSet = await _context.PermissionSets.FindAsync(dto.PermissionSetId);
            if (permissionSet == null) return NotFound(new { Message = "Permission set not found" });

            if (permissionSet.IsSystem)
                return BadRequest(new { Message = "Cannot assign the system Admin permission set directly." });

            var currentUserId = User.FindFirst("uid")?.Value ?? "system";
            await _permissionService.AssignPermissionSetToUserAsync(userId, dto.PermissionSetId, currentUserId);

            return Ok(new { Message = "Permission set assigned successfully" });
        }

        [HttpDelete("users/{userId}/permission-sets/{permissionSetId}")]
        public async Task<IActionResult> UnassignPermissionSetFromUser(string userId, int permissionSetId)
        {
            var permissionSet = await _context.PermissionSets.FindAsync(permissionSetId);
            if (permissionSet?.IsSystem == true)
                return BadRequest(new { Message = "Cannot unassign the system Admin permission set." });

            await _permissionService.UnassignPermissionSetFromUserAsync(userId, permissionSetId);
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

            // Get permissions from user's assigned permission sets and direct permissions
            var perms = await _permissionService.GetUserPermissionsAsync(userId);
            
            // If user has Admin role, L1 role, or System Admin profile, they get all permissions
            var isSystemAdmin = User.FindFirst("isSystemAdmin")?.Value?.ToLower() == "true";
            if (roles.Contains("Admin") || roles.Contains("L1") || isSystemAdmin) {
                var allPermissions = await _permissionService.GetAllPermissionsAsync();
                var allNames = allPermissions.Select(x => x.Name).ToList();
                perms = perms.Union(allNames).Distinct().ToList();
            }

            return Ok(perms);
        }
    }
}