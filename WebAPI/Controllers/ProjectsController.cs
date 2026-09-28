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
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IEmployeeService _employeeService;
        private readonly IAllocationService _allocationService;

        private readonly IMapper _mapper;

        public ProjectsController(IProjectService projectService, IEmployeeService employeeService, IAllocationService allocationService, IMapper mapper)
        {
            _projectService = projectService;
            _employeeService = employeeService;
            _allocationService = allocationService;
            _mapper = mapper;
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project == null) return NotFound();

            return Ok(_mapper.Map<ProjectDto>(project));
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
        {
            var projects = await _projectService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<ProjectDto>>(projects));
        }

        // POST: api/projects
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectDto dto)
        {
            var entity = _mapper.Map<Project>(dto);
            await _projectService.AddAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.ProjectId }, dto);
        }


        [HttpPut("{projectId}/employees/{employeeId}")]
        public async Task<IActionResult> AssignEmployeeToProject(int projectId, int employeeId)
        {
            var project = await _projectService.GetByIdAsync(projectId);
            var employee = await _employeeService.GetByIdAsync(employeeId);

            if (project == null || employee == null)
                return NotFound("Project or Employee not found");

            var allocation = new Allocation
            {
                EmployeeId = employeeId,
                ProjectId = projectId,
                StartDate = DateTime.UtcNow
            };

            await _allocationService.AddAsync(allocation);

            return Ok($"Project {project.ProjectName} now has Employee {employee.Name}");
        }


        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectDto dto)
        {
            if (id != dto.ProjectId) return BadRequest("ID mismatch");

            var entity = _mapper.Map<Project>(dto);
            await _projectService.UpdateAsync(entity);
            return NoContent();
        }

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _projectService.DeleteAsync(id);
            return NoContent();
        }
    }
}
