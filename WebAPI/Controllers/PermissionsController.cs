using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public PermissionsController(IPermissionService permissionService, RoleManager<IdentityRole> roleManager)
        {
            _permissionService = permissionService;
            _roleManager = roleManager;
        }

        [HttpGet("all-permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var p = await _permissionService.GetAllPermissionsAsync();
            return Ok(p);
        }

        [HttpGet("permission-sets")]
        public async Task<IActionResult> GetPermissionSets()
        {
            var sets = await _permissionService.GetAllPermissionSetsAsync();
            return Ok(sets.Select(s => new {
                s.Id,
                s.Name,
                s.Description,
                Permissions = s.Permissions.Select(p => new { p.Id, p.Name })
            }));
        }

        public class CreatePermissionSetDto { public string Name { get; set; } public string Description { get; set; } public List<int> PermissionIds { get; set; } }

        [HttpPost("permission-sets")]
        public async Task<IActionResult> CreatePermissionSet([FromBody] CreatePermissionSetDto dto)
        {
            var p = await _permissionService.CreatePermissionSetAsync(dto.Name, dto.Description, dto.PermissionIds);
            return Ok(p);
        }

        [HttpPut("permission-sets/{id}")]
        public async Task<IActionResult> UpdatePermissionSet(int id, [FromBody] CreatePermissionSetDto dto)
        {
            var p = await _permissionService.UpdatePermissionSetAsync(id, dto.Name, dto.Description, dto.PermissionIds);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpDelete("permission-sets/{id}")]
        public async Task<IActionResult> DeletePermissionSet(int id)
        {
            await _permissionService.DeletePermissionSetAsync(id);
            return Ok();
        }

        [HttpGet("roles")]
        public IActionResult GetRoles()
        {
            return Ok(_roleManager.Roles.Select(r => new { r.Id, r.Name }));
        }

        [HttpPost("roles/{roleId}/permission-set/{permissionSetId}")]
        public async Task<IActionResult> AssignPermissionSetToRole(string roleId, int permissionSetId)
        {
            await _permissionService.UpdateRolePermissionSetAsync(roleId, permissionSetId);
            return Ok();
        }

        [HttpGet("my-permissions")]
        public async Task<IActionResult> GetMyPermissions()
        {
            // Use "uid" claim type to match what AuthController sets in the JWT
            var userId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userManager = HttpContext.RequestServices.GetService<UserManager<ApplicationUser>>();
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();
            
            var roles = await userManager.GetRolesAsync(user);

            var roleIds = new List<string>();
            foreach(var role in roles) {
                var r = await _roleManager.FindByNameAsync(role);
                if (r != null) roleIds.Add(r.Id);
            }

            var perms = await _permissionService.GetUserPermissionsAsync(roleIds);
            
            // temporary logic
            if (roles.Contains("Admin") || roles.Contains("L1")) {
                var allPerms = await _permissionService.GetAllPermissionsAsync();
                var allNames = allPerms.Select(x => x.Name).ToList();
                perms = perms.Union(allNames).Distinct().ToList();
            }

            return Ok(perms);
        }
    }
}