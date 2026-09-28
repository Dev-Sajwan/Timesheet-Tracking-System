using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
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

        public EmployeesController(IEmployeeService employeeService, IProjectService projectService, IAllocationService allocationService, IMapper mapper)
        {
            _employeeService = employeeService;
            _allocationService = allocationService;
            _projectService = projectService;
            _mapper = mapper;
        }

        // GET: api/employees/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetById(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null) return NotFound();

            return Ok(_mapper.Map<EmployeeDto>(employee));
        }

        // GET: api/employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
        {
            var employees = await _employeeService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<EmployeeDto>>(employees));
        }

        // POST: api/employees

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            var entity = _mapper.Map<Employee>(dto);
            await _employeeService.AddAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.EmployeeId }, dto);
        }

        [HttpPut("{projectId}/employees/{employeeId}")]
        public async Task<IActionResult> AssignEmployeeToProject(int projectId, int employeeId)
        {
            var project = await _projectService.GetByIdAsync(projectId);
            var employee = await _employeeService.GetByIdAsync(employeeId);

            if (project == null || employee == null)
                return NotFound("Project or Employee not found");

            // Check if allocation already exists
            var existingAllocation = await _allocationService.GetByEmployeeAndProjectAsync(employeeId, projectId);

            if (existingAllocation != null)
            {
                // Update existing allocation (e.g., reset start date)
                existingAllocation.StartDate = DateTime.UtcNow;
                await _allocationService.UpdateAsync(existingAllocation);
                return Ok($"Employee {employee.Name} re-assigned to Project {project.ProjectName}");
            }
            else
            {
                // Create new allocation
                var allocation = new Allocation
                {
                    EmployeeId = employeeId,
                    ProjectId = projectId,
                    StartDate = DateTime.UtcNow
                };

                await _allocationService.AddAsync(allocation);
                return Ok($"Employee {employee.Name} assigned to Project {project.ProjectName}");
            }
        }



        // PUT: api/employees/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeDto dto)
        {
            if (id != dto.EmployeeId) return BadRequest("ID mismatch");

            var entity = _mapper.Map<Employee>(dto);
            await _employeeService.UpdateAsync(entity);
            return NoContent();
        }

        // DELETE: api/employees/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _employeeService.DeleteAsync(id);
            return NoContent();
        }
    }
}
