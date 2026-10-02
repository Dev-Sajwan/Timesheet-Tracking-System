using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IProjectService _projectService;
        private readonly IAllocationService _allocationService;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmployeesController(
            IEmployeeService employeeService,
            IProjectService projectService,
            IAllocationService allocationService,
            IMapper mapper,
            UserManager<ApplicationUser> userManager)
        {
            _employeeService = employeeService;
            _allocationService = allocationService;
            _projectService = projectService;
            _mapper = mapper;
            _userManager = userManager;
        }

        // ---------------- CRUD endpoints ----------------

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetById(string id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null) return NotFound("Employee not found");

            var dto = _mapper.Map<EmployeeDto>(employee);
            // Fetch roles from Identity
            var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
            if (user != null)
            {
                dto.Roles = (await _userManager.GetRolesAsync(user)).ToList();
            }
            return Ok(dto);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            var employees = await _employeeService.GetAllAsync();
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            // Check if email already exists as Identity user
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest("A user with this email already exists.");

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
                return BadRequest(createResult.Errors);

            // Assign Employee role by default
            var roleResult = await _userManager.AddToRoleAsync(user, "Employee");
            if (!roleResult.Succeeded)
            {
                // Cleanup user if role assignment fails
                await _userManager.DeleteAsync(user);
                return BadRequest(roleResult.Errors);
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

            return CreatedAtAction(nameof(GetById), new { id = employee.Id }, new
            {
                EmployeeId = employee.Id,
                UserId = user.Id,
                Message = "Employee created with Identity user. Default password: TempPass123!"
            });
        }

        [HttpPut("{projectId}/employees/{employeeId}")]
        public async Task<IActionResult> AssignEmployeeToProject(int projectId, string employeeId)
        {
            var project = await _projectService.GetByIdAsync(projectId);
            var employee = await _employeeService.GetByIdAsync(employeeId);

            if (project == null || employee == null)
                return NotFound("Project or Employee not found");

            var existingAllocation = await _allocationService.GetByEmployeeAndProjectAsync(employeeId, projectId);

            if (existingAllocation != null)
            {
                existingAllocation.StartDate = DateTime.UtcNow;
                await _allocationService.UpdateAsync(existingAllocation);
                return Ok($"Employee {employee.Name} re-assigned to Project {project.ProjectName}");
            }

            var allocation = new Allocation
            {
                EmployeeId = employeeId,
                ProjectId = projectId,
                StartDate = DateTime.UtcNow
            };

            await _allocationService.AddAsync(allocation);
            return Ok($"Employee {employee.Name} assigned to Project {project.ProjectName}");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] EmployeeDto dto)
        {
            var existingEmployee = await _employeeService.GetByIdAsync(id);
            if (existingEmployee == null) return NotFound("Employee not found");



            

            // Update only allowed fields (not Role, not UserId)
            existingEmployee.Name = dto.Name;
            existingEmployee.Email = dto.Email;
            existingEmployee.Status = dto.Status;
            existingEmployee.Department = dto.Department;

            await _employeeService.UpdateAsync(existingEmployee);
            return Ok("Employee updated successfully!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _employeeService.DeleteAsync(id);
            return Ok("Employee deleted successfully!");
        }

        // ---------------- Role Management endpoints (Admin only) ----------------

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}/roles")]
        public async Task<ActionResult<List<string>>> GetRoles(string id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null) return NotFound("Employee not found");

            var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
            if (user == null) return NotFound("Identity user not found");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles.ToList());
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/roles")]
        public async Task<IActionResult> AssignRole(string id, [FromBody] AssignRoleRequestDto request)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null) return NotFound("Employee not found");

            var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
            if (user == null) return NotFound("Identity user not found");

            var allowedRoles = new[] { "Admin", "Manager", "Employee" };
            var role = request.Role;

            if (!allowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
                return BadRequest("Invalid role. Allowed: Admin, Manager, Employee");

            // Find the correct case
            role = allowedRoles.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

            // Remove existing roles from allowed set
            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToRemove = currentRoles.Where(r => allowedRoles.Contains(r, StringComparer.OrdinalIgnoreCase));
            if (rolesToRemove.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeResult.Succeeded)
                    return BadRequest(removeResult.Errors);
            }

            // Add new role
            var addResult = await _userManager.AddToRoleAsync(user, role);
            if (!addResult.Succeeded)
                return BadRequest(addResult.Errors);

            return Ok(new { Message = $"Role '{role}' assigned successfully.", Role = role });
        }

        // Admin: Reset employee password
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordDto dto)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null) return NotFound("Employee not found");

            var user = await _userManager.FindByIdAsync(employee.UserId ?? "");
            if (user == null) return NotFound("Identity user not found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
            
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = "Password reset successfully." });
        }
    }
}
