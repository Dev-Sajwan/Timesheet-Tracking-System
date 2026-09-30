using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmployeeRepository _employeeRepository;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IEmployeeRepository employeeRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _employeeRepository = employeeRepository;
        }

        // Register new user + employee
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserRequestDto request)
        {
            var user = new ApplicationUser { UserName = request.UserName, Email = request.Email };
            var result = await _userManager.CreateAsync(user, request.Password);

            if (string.IsNullOrWhiteSpace(request.UserName))
                return BadRequest("UserName is required and must contain only letters or digits.");

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var employee = new Employee
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.FullName,
                Department = request.Department,
                Status = "Active",
                UserId = user.Id
            };

            await _employeeRepository.AddAsync(employee);

            return Ok(new { Message = "User registered successfully", EmployeeId = employee.Id, UserId = user.Id });
        }

        // Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _signInManager.PasswordSignInAsync(request.UserName, request.Password, false, false);

            if (!result.Succeeded)
                return Unauthorized(new { Message = "Invalid credentials" });

            return Ok(new { Message = "Login successful" });
        }

        // Assign role

        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")] // Only admins can assign roles
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.EmployeeId);
            if (user == null) return NotFound("User not found");

            if (!await _roleManager.RoleExistsAsync(request.RoleName))
                return BadRequest("Role does not exist");

            var result = await _userManager.AddToRoleAsync(user, request.RoleName);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = $"Role '{request.RoleName}' assigned to user {user.UserName}" });
        }
    }
}
