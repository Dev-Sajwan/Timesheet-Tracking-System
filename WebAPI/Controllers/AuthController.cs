using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IEmployeeRepository employeeRepository,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _employeeRepository = employeeRepository;
            _configuration = configuration;
        }

        // Register new user + employee
        [HttpPost("register")]
 
        public async Task<IActionResult> Register([FromBody] CreateUserRequestDto request)
        {
            // 1. Validate required fields
            if (string.IsNullOrWhiteSpace(request.UserName))
                return BadRequest("UserName is required.");

            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Password is required.");

            // 2. Clean up input
            var userName = request.UserName.Trim();
            var email = request.Email.Trim();

            // 3. Create Identity user
            var user = new ApplicationUser
            {
                UserName = userName,
                Email = email
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            // 4. Return the actual Identity errors
            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    Errors = result.Errors.Select(e => new
                    {
                        e.Code,
                        e.Description
                    })
                });
            }

            // Assign Employee role
            var roleResult = await _userManager.AddToRoleAsync(
                user, "Employee");

            if (!roleResult.Succeeded)
            {
                return BadRequest(roleResult.Errors);
            }

            // 5. Create Employee record
            var employee = new Employee
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.FullName,
                Email = request.Email,
                Department = request.Department,
                Status = "Active",
                UserId = user.Id
            };

            await _employeeRepository.AddAsync(employee);

            return Ok(new
            {
                Message = "User registered successfully",
                EmployeeId = employee.Id,
                UserId = user.Id,
                UserName = user.UserName,
                Email = user.Email
            });
        }

        // Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid credentials" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { Message = "Invalid credentials" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("uid", user.Id)
            };

            var employee = await _employeeRepository.GetByUserIdAsync(user.Id);
            if (employee != null)
            {
                authClaims.Add(new Claim("employeeId", employee.Id));
                authClaims.Add(new Claim("fullName", employee.Name));
            }

            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:ValidIssuer"],
                audience: _configuration["Jwt:ValidAudience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo,
                Roles = roles
            });
        }

        // Assign role

        [Authorize(Roles = "Admin")]
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequestDto request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user == null)
                return NotFound("User not found.");

            var allowedRoles = new[] { "Admin", "Manager", "Employee" };

            if (!allowedRoles.Contains(
                request.Role,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("Invalid role.");
            }

            // Find the existing role
            var role = allowedRoles.First(r =>
                r.Equals(request.Role, StringComparison.OrdinalIgnoreCase));

            if (!await _roleManager.RoleExistsAsync(role))
                return BadRequest("Role does not exist.");

            // Avoid assigning the same role twice
            if (await _userManager.IsInRoleAsync(user, role))
                return BadRequest("User already has this role.");

            var result = await _userManager.AddToRoleAsync(user, role);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                Message = $"Role '{role}' assigned successfully.",
                UserId = user.Id,
                UserName = user.UserName,
                Role = role
            });
        }

        // Forgot Password - sends reset token (in real app, send via email)
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Don't reveal if user exists - always return success for security
                return Ok(new { Message = "If the email exists, a reset link has been sent." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // In production, send this token via email
            // For development, return it in response (remove in production!)
            return Ok(new 
            { 
                Message = "If the email exists, a reset link has been sent.",
                // REMOVE IN PRODUCTION - only for development testing
                ResetToken = token,
                UserId = user.Id
            });
        }

        // Reset Password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");
            
            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest("Reset token is required.");
            
            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest("New password is required.");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest("Invalid request.");

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Password has been reset successfully." });
        }
    }
}
