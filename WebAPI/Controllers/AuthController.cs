using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITimesheetDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IEmployeeRepository employeeRepository,
            ITimesheetDbContext context,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _employeeRepository = employeeRepository;
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
        }

        // Register new user + employee
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserRequestDto request)
        {
            try
            {
                _logger.LogInformation("Registering new user: {UserName}", request.UserName);

                // 1. Validate required fields
                if (string.IsNullOrWhiteSpace(request.UserName))
                    return BadRequest(new { Message = "UserName is required." });

                if (string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { Message = "Email is required." });

                if (string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest(new { Message = "Password is required." });

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
                    _logger.LogWarning("User registration failed: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(new
                    {
                        Message = "Registration failed",
                        Errors = result.Errors.Select(e => new
                        {
                            e.Code,
                            e.Description
                        })
                    });
                }

                // Assign Employee role
                var roleResult = await _userManager.AddToRoleAsync(user, "Employee");
                if (!roleResult.Succeeded)
                {
                    _logger.LogError("Failed to assign Employee role: {Errors}", string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                    return BadRequest(new { Message = "Failed to assign role", Errors = roleResult.Errors });
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
                _logger.LogInformation("User registered successfully: {UserId}, EmployeeId: {EmployeeId}", user.Id, employee.Id);

                return Ok(new
                {
                    Message = "User registered successfully",
                    EmployeeId = employee.Id,
                    UserId = user.Id,
                    UserName = user.UserName,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user: {UserName}", request.UserName);
                return StatusCode(500, new { Message = "An error occurred during registration" });
            }
        }

        // Login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Login attempt for user: {UserName}", request.UserName);
                
                // Try to find user by username first, then by email
                var user = await _userManager.FindByNameAsync(request.UserName);
                if (user == null)
                {
                    // If not found by username, try by email
                    user = await _userManager.FindByEmailAsync(request.UserName);
                    if (user == null)
                    {
                        _logger.LogWarning("Login failed - user not found: {UserName}", request.UserName);
                        return Unauthorized(new { Message = "Invalid credentials" });
                    }
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Login failed - invalid password for user: {UserName}", request.UserName);
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
                    
                    // Add Profile information
                    if (employee.ProfileId.HasValue)
                    {
                        var profile = await _context.Profiles.FindAsync(employee.ProfileId.Value);
                        if (profile != null)
                        {
                            authClaims.Add(new Claim("profileId", profile.ProfileId.ToString()));
                            authClaims.Add(new Claim("profileName", profile.Name));
                            authClaims.Add(new Claim("isSystemAdmin", profile.IsSystemAdmin.ToString().ToLower()));
                        }
                    }
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

                _logger.LogInformation("User logged in successfully: {UserId}", user.Id);

                return Ok(new
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    Expiration = token.ValidTo,
                    Roles = roles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {UserName}", request.UserName);
                return StatusCode(500, new { Message = "An error occurred during login" });
            }
        }

        // Assign role (Admin only)
// removed authorize roles
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequestDto request)
        {
            try
            {
                _logger.LogInformation("Assigning role to user: {UserId}, Role: {Role}", request.UserId, request.Role);
                var user = await _userManager.FindByIdAsync(request.UserId);

                if (user == null)
                {
                    _logger.LogWarning("User not found for role assignment: {UserId}", request.UserId);
                    return NotFound(new { Message = "User not found." });
                }

                var allowedRoles = new[] { "L1", "L2", "L3", "L4" };

                if (!allowedRoles.Contains(request.Role, StringComparer.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Invalid role requested: {Role}", request.Role);
                    return BadRequest(new { Message = "Invalid role. Allowed Only L1, L2, L3, L4" });
                }

                // Find the existing role
                var role = allowedRoles.First(r => r.Equals(request.Role, StringComparison.OrdinalIgnoreCase));

                if (!await _roleManager.RoleExistsAsync(role))
                {
                    return BadRequest(new { Message = "Role does not exist." });
                }

                // Avoid assigning the same role twice
                if (await _userManager.IsInRoleAsync(user, role))
                {
                    return BadRequest(new { Message = "User already has this role." });
                }

                var result = await _userManager.AddToRoleAsync(user, role);

                if (!result.Succeeded)
                {
                    _logger.LogError("Failed to assign role: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(new { Message = "Failed to assign role", Errors = result.Errors });
                }

                _logger.LogInformation("Role assigned successfully: {UserId}, Role: {Role}", user.Id, role);
                return Ok(new
                {
                    Message = $"Role '{role}' assigned successfully.",
                    UserId = user.Id,
                    UserName = user.UserName,
                    Role = role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role to user: {UserId}", request.UserId);
                return StatusCode(500, new { Message = "An error occurred while assigning the role" });
            }
        }

        // Forgot Password - sends reset token via email
        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new
                    {
                        Message = "Email is required."
                    });
                }

                try
                {
                    var user = await _userManager.FindByEmailAsync(
                        request.Email.Trim());

                    // Avoid revealing whether an account exists.
                    if (user == null)
                    {
                        return Ok(new
                        {
                            Message = "If the email exists, a reset link has been sent."
                        });
                    }

                    if (string.IsNullOrWhiteSpace(user.Email))
                    {
                        _logger.LogWarning(
                            "Password reset requested for a user without an email.");

                        return Ok(new
                        {
                            Message = "If the email exists, a reset link has been sent."
                        });
                    }

                    var token =
                        await _userManager.GeneratePasswordResetTokenAsync(user);

                    var frontendUrl =
                        _configuration["FrontendSettings:Url"]
                        ?? "http://localhost:3000";

                    var resetLink =
                        $"{frontendUrl.TrimEnd('/')}/reset-password" +
                        $"?email={Uri.EscapeDataString(user.Email)}" +
                        $"&token={Uri.EscapeDataString(token)}";

                    var subject = "Password Reset Request";

                    var htmlMessage = $"""
                <p>Hello,</p>
                <p>You requested a password reset.</p>
                <p>
                    <a href="{System.Net.WebUtility.HtmlEncode(resetLink)}">
                        Reset Password
                    </a>
                </p>
                <p>If you did not request this, please ignore this email.</p>
                """;

                    await _emailService.SendEmailAsync(
                        user.Email,
                        subject,
                        htmlMessage);

                    _logger.LogInformation(
                        "Password reset email accepted for user {UserId}",
                        user.Id);

                    return Ok(new
                    {
                        Message = "If the email exists, a reset link has been sent."
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to process the password reset request.");

                    return StatusCode(500, new
                    {
                        Message = "Unable to process the request. Please try again later."
                    });
                }
            }

        // Reset Password
        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            try
            {
                _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);
                if (string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { Message = "Email is required." });
                
                if (string.IsNullOrWhiteSpace(request.Token))
                    return BadRequest(new { Message = "Reset token is required." });
                
                if (string.IsNullOrWhiteSpace(request.NewPassword))
                    return BadRequest(new { Message = "New password is required." });

                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    _logger.LogWarning("Password reset failed - user not found: {Email}", request.Email);
                    return BadRequest(new { Message = "Invalid request." });
                }

                var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Password reset failed for user: {UserId}, Errors: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(new { Message = "Password reset failed", Errors = result.Errors });
                }

                _logger.LogInformation("Password reset successfully for user: {UserId}", user.Id);
                return Ok(new { Message = "Password has been reset successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email: {Email}", request.Email);
                return StatusCode(500, new { Message = "An error occurred while resetting the password" });
            }
        }
    }
}