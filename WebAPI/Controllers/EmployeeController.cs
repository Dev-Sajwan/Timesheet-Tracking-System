using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
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

        public EmployeesController(
            IEmployeeService employeeService,
            IProjectService projectService,
            IAllocationService allocationService,
            IMapper mapper)
        {
            _employeeService = employeeService;
            _allocationService = allocationService;
            _projectService = projectService;
            _mapper = mapper;
        }

        // ---------------- CRUD endpoints ----------------

        [HttpGet("{email}")]
        public async Task<ActionResult<EmployeeDto>> GetByEmail(string email)
        {
            var employee = await _employeeService.GetByEmailAsync(email);
            if (employee == null) return NotFound("Employee not found");

            return Ok(_mapper.Map<EmployeeDto>(employee));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            var employees = await _employeeService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<EmployeeDto>>(employees));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            var entity = _mapper.Map<Employee>(dto);
            entity.Id = Guid.NewGuid().ToString();
            await _employeeService.AddAsync(entity);
            return CreatedAtAction(nameof(GetByEmail), new { email = entity.Email }, dto);
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

        [HttpPut("{email}")]
        public async Task<IActionResult> Update(string email, [FromBody] EmployeeDto dto)
        {
            if (email != dto.Email)
                return BadRequest("Email mismatch");

            var entity = _mapper.Map<Employee>(dto);
            await _employeeService.UpdateAsync(entity);

            return Ok("Employee updated successfully!");
        }

        [HttpDelete("{email}")]
        public async Task<IActionResult> Delete(string email)
        {
            await _employeeService.DeleteAsync(email);
            return Ok("User deleted successfully!");
        }

        // ---------------- Identity-backed endpoints ----------------

        //[HttpPost("register")]
        //public async Task<IActionResult> Register([FromBody] CreateUserRequestDto request)
        //{
        //    try
        //    {
        //        var user = await _employeeService.RegisterUser(request);
        //        return Ok(new { Message = "User registered successfully", UserId = user.Id });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { Message = ex.Message });
        //    }
        //}

        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginRequest request)
        //{
        //    var isValid = await _employeeService.Authenticate(request);
        //    if (!isValid) return Unauthorized(new { Message = "Invalid credentials" });

        //    return Ok(new { Message = "Login successful" });
        //}

        //[HttpPost("assign-role")]
        //[Authorize(Roles = "Admin")] // Only admins can assign roles
        //public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        //{
        //    try
        //    {
        //        await _employeeService.AssignRole(request);
        //        return Ok(new { Message = "Role assigned successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { Message = ex.Message });
        //    }
        //}
    }
}
