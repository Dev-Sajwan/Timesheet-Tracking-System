using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileController(IPermissionService permissionService, UserManager<ApplicationUser> userManager)
        {
            _permissionService = permissionService;
            _userManager = userManager;
        }

        [HttpGet("profiles")]
        public async Task<IActionResult> GetProfiles()
        {
            var profiles = await _permissionService.GetAllProfilesAsync();
            return Ok(profiles.Select(p => new
            {
                p.ProfileId,
                p.Name,
                p.Description,
                p.IsSystemAdmin,
                UserCount = p.Users.Count
            }));
        }

        public class CreateProfileDto
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public bool IsSystemAdmin { get; set; }
        }

        [HttpPost("profiles")]
        public async Task<IActionResult> CreateProfile([FromBody] CreateProfileDto dto)
        {
            var profile = await _permissionService.CreateProfileAsync(dto.Name, dto.Description, dto.IsSystemAdmin);
            return Ok(new { profile.ProfileId, profile.Name, profile.Description, profile.IsSystemAdmin });
        }

        public class UpdateProfileDto
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public bool IsSystemAdmin { get; set; }
        }

        [HttpPut("profiles/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
        {
            var profile = await _permissionService.UpdateProfileAsync(id, dto.Name, dto.Description, dto.IsSystemAdmin);
            if (profile == null) return NotFound();
            return Ok(new { profile.ProfileId, profile.Name, profile.Description, profile.IsSystemAdmin });
        }

        [HttpDelete("profiles/{id}")]
        public async Task<IActionResult> DeleteProfile(int id)
        {
            await _permissionService.DeleteProfileAsync(id);
            return Ok();
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users.Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.FullName,
                ProfileId = u.ProfileId
            }).ToList();
            return Ok(users);
        }

        public class AssignProfileDto
        {
            public int? ProfileId { get; set; }
        }

        [HttpPut("users/{userId}/profile")]
        public async Task<IActionResult> AssignProfileToUser(string userId, [FromBody] AssignProfileDto dto)
        {
            await _permissionService.AssignProfileToUserAsync(userId, dto.ProfileId);
            return Ok("Profile updated successfully");
        }

        [HttpGet("users/{userId}/profile")]
        public async Task<IActionResult> GetUserProfile(string userId)
        {
            var profile = await _permissionService.GetUserProfileAsync(userId);
            if (profile == null) return NotFound();
            return Ok(new { profile.ProfileId, profile.Name, profile.Description, profile.IsSystemAdmin });
        }
    }
}