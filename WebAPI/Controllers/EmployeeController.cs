using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IProjectService _projectService;
        private readonly IAllocationService _allocationService;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(
            IEmployeeService employeeService,
            IProjectService projectService,
            IAllocationService allocationService,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            ILogger<EmployeesController> logger)
        {
            _employeeService = employeeService;
            _allocationService = allocationService;
            _projectService = projectService;
            _mapper = mapper;
            _userManager = userManager;
            _logger = logger;
        }

        // ---------------- CRUD endpoints ----------------

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetById(string id)
        {
            try
            {
                _logger.LogInformation("Getting employee by ID: {EmployeeId}", id);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    _logger.LogWarning("Employee not found: {EmployeeId}", id);
                    return NotFound(new { Message = "Employee not found" });
                }

                var dto = _mapper.Map<EmployeeDto>(employee);
                // Fetch roles from Identity
                var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
                if (user != null)
                {
                    dto.Roles = (await _userManager.GetRolesAsync(user)).ToList();
                }
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting employee by ID: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the employee" });
            }
        }

[HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all employees");
                
                // Get current user's role from token
                var currentUserRole = User.FindFirst("role")?.Value 
                    ?? User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                
                var employees = await _employeeService.GetAllAsync(currentUserRole);
                var dtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);
                
                // Fetch roles for each employee from Identity
                foreach (var dto in dtos)
                {
                    var employee = employees.FirstOrDefault(e => e.Id == dto.Id);
                    if (employee != null)
                    {
                        var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
                        if (user != null)
                        {
                            dto.Roles = (await _userManager.GetRolesAsync(user)).ToList();
                        }
                    }
                }
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all employees");
                return StatusCode(500, new { Message = "An error occurred while retrieving employees" });
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk([FromBody] List<EmployeeDto> employeeDtos)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdEmployees = new List<EmployeeDto>();

            foreach(var employeeDto in employeeDtos)
            {
                var user = new ApplicationUser
                {
                    UserName = employeeDto.Email.Split('@')[0] + Guid.NewGuid().ToString().Substring(0,4),
                    Email = employeeDto.Email,
                    FullName = employeeDto.Name,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, "TempPass123!");
                if (!result.Succeeded)
                {
                    continue; // skip failed
                }

                var empEntity = new Employee
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = employeeDto.Name,
                    Email = employeeDto.Email,
                    Department = employeeDto.Department ?? "",
                    Status = "Active",
                    UserId = user.Id
                };

                await _employeeService.AddAsync(empEntity);
                employeeDto.Id = empEntity.Id;
                createdEmployees.Add(employeeDto);
            }

            return Ok(createdEmployees);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            try
            {
                _logger.LogInformation("Creating new employee: {Email}", dto.Email);
                
                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Email))
                {
                    return BadRequest(new { Message = "Email is required" });
                }

                // Check if email already exists as Identity user
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning("Attempt to create employee with existing email: {Email}", dto.Email);
                    return BadRequest(new { Message = "A user with this email already exists." });
                }

                // Create Identity user with a default password (should be changed on first login)
                var userName = dto.Email; // Use email as username
                var defaultPassword = "TempPass123!"; // Temporary password
                
                var user = new ApplicationUser
                {
                    UserName = userName,
                    Email = dto.Email,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user, defaultPassword);
                if (!createResult.Succeeded)
                {
                    _logger.LogError("Failed to create Identity user: {Errors}", string.Join(", ", createResult.Errors.Select(e => e.Description)));
                    return BadRequest(new { Message = "Failed to create user", Errors = createResult.Errors });
                }

                // Assign Employee role by default
                var roleResult = await _userManager.AddToRoleAsync(user, "Employee");
                if (!roleResult.Succeeded)
                {
                    // Cleanup user if role assignment fails
                    await _userManager.DeleteAsync(user);
                    _logger.LogError("Failed to assign role to user: {Errors}", string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                    return BadRequest(new { Message = "Failed to assign role", Errors = roleResult.Errors });
                }

                // Create Employee record linked to Identity user
                var employee = new Employee
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.Name,
                    Email = dto.Email,
                    Department = dto.Department,
                    Status = dto.Status,
                    UserId = user.Id
                };

                await _employeeService.AddAsync(employee);
                _logger.LogInformation("Employee created successfully: {EmployeeId}", employee.Id);

                return CreatedAtAction(nameof(GetById), new { id = employee.Id }, new
                {
                    EmployeeId = employee.Id,
                    UserId = user.Id,
                    Message = "Employee created with Identity user. Default password: TempPass123!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee: {Email}", dto.Email);
                return StatusCode(500, new { Message = "An error occurred while creating the employee" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] EmployeeDto dto)
        {
            try
            {
                _logger.LogInformation("Updating employee: {EmployeeId}", id);
                var existingEmployee = await _employeeService.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    _logger.LogWarning("Employee not found for update: {EmployeeId}", id);
                    return NotFound(new { Message = "Employee not found" });
                }

                // Update only allowed fields (not Role, not UserId)
                existingEmployee.Name = dto.Name;
                existingEmployee.Email = dto.Email;
                existingEmployee.Status = dto.Status;
                existingEmployee.Department = dto.Department;

                await _employeeService.UpdateAsync(existingEmployee);
                _logger.LogInformation("Employee updated successfully: {EmployeeId}", id);
                return Ok(new { Message = "Employee updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating employee: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while updating the employee" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                _logger.LogInformation("Deleting employee: {EmployeeId}", id);
                await _employeeService.DeleteAsync(id);
                _logger.LogInformation("Employee deleted successfully: {EmployeeId}", id);
                return Ok(new { Message = "Employee deleted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting employee: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the employee" });
            }
        }

        // ---------------- Role Management endpoints (Admin only) ----------------

        [Authorize]
        [HttpGet("{id}/roles")]
        public async Task<ActionResult<List<string>>> GetRoles(string id)
        {
            try
            {
                _logger.LogInformation("Getting roles for employee: {EmployeeId}", id);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null) return NotFound(new { Message = "Employee not found" });

                var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
                if (user == null) return NotFound(new { Message = "Identity user not found" });

                var roles = await _userManager.GetRolesAsync(user);
                return Ok(roles.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles for employee: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving roles" });
            }
        }

        [Authorize]
        [HttpPut("{id}/roles")]
        public async Task<IActionResult> AssignRole(string id, [FromBody] AssignRoleRequestDto request)
        {
            try
            {
                _logger.LogInformation("Assigning role to employee: {EmployeeId}, Role: {Role}", id, request.Role);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null) return NotFound(new { Message = "Employee not found" });

                var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
                if (user == null) return NotFound(new { Message = "Identity user not found" });

                var allowedRoles = new[] { "L1", "L2", "L3", "L4" };
                var role = request.Role;

                if (!allowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Invalid role. Allowed:  L1, L2, L3, L4" });

                // Find the correct case
                role = allowedRoles.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

                // Remove existing roles from allowed set
                var currentRoles = await _userManager.GetRolesAsync(user);
                var rolesToRemove = currentRoles.Where(r => allowedRoles.Contains(r, StringComparer.OrdinalIgnoreCase));
                if (rolesToRemove.Any())
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                    if (!removeResult.Succeeded)
                        return BadRequest(new { Message = "Failed to remove existing roles", Errors = removeResult.Errors });
                }

                // Add new role
                var addResult = await _userManager.AddToRoleAsync(user, role);
                if (!addResult.Succeeded)
                    return BadRequest(new { Message = "Failed to assign role", Errors = addResult.Errors });

                _logger.LogInformation("Role assigned successfully: {EmployeeId}, Role: {Role}", id, role);
                return Ok(new { Message = $"Role '{role}' assigned successfully.", Role = role });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role to employee: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while assigning the role" });
            }
        }

        // Admin: Reset employee password
        [Authorize]
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordDto dto)
        {
            try
            {
                _logger.LogInformation("Resetting password for employee: {EmployeeId}", id);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null) return NotFound(new { Message = "Employee not found" });

                var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
                if (user == null) return NotFound(new { Message = "Identity user not found" });

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
                
                if (!result.Succeeded)
                    return BadRequest(new { Message = "Failed to reset password", Errors = result.Errors });

                _logger.LogInformation("Password reset successfully for employee: {EmployeeId}", id);
                return Ok(new { Message = "Password reset successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for employee: {EmployeeId}", id);
                return StatusCode(500, new { Message = "An error occurred while resetting the password" });
            }
        }
    }
}