using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IEmployeeService _employeeService;
        private readonly IAllocationService _allocationService;
        private readonly IMapper _mapper;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(
            IProjectService projectService, 
            IEmployeeService employeeService, 
            IAllocationService allocationService, 
            IMapper mapper,
            ILogger<ProjectsController> logger)
        {
            _projectService = projectService;
            _employeeService = employeeService;
            _allocationService = allocationService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting project by ID: {ProjectId}", id);
                var project = await _projectService.GetByIdAsync(id);
                if (project == null)
                {
                    _logger.LogWarning("Project not found: {ProjectId}", id);
                    return NotFound(new { Message = "Project not found" });
                }

                return Ok(_mapper.Map<ProjectDto>(project));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project by ID: {ProjectId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the project" });
            }
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all projects");
                var projects = await _projectService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<ProjectDto>>(projects));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all projects");
                return StatusCode(500, new { Message = "An error occurred while retrieving projects" });
            }
        }

        // POST: api/projects
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectDto dto)
        {
            try
            {
                _logger.LogInformation("Creating new project: {ProjectName}", dto.ProjectName);
                
                if (string.IsNullOrWhiteSpace(dto.ProjectName))
                    return BadRequest(new { Message = "Project name is required." });

                // Check for duplicate project
                var exists = await _projectService.ExistsByNameAsync(dto.ProjectName.Trim());
                if (exists)
                {
                    _logger.LogWarning("Attempt to create duplicate project: {ProjectName}", dto.ProjectName);
                    return Conflict(new { Message = "A project with this name already exists." });
                }

                var entity = _mapper.Map<Project>(dto);
                entity.ProjectName = dto.ProjectName.Trim();

                await _projectService.AddAsync(entity);
                _logger.LogInformation("Project created successfully: {ProjectId}", entity.ProjectId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = entity.ProjectId },
                    entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project: {ProjectName}", dto.ProjectName);
                return StatusCode(500, new { Message = "An error occurred while creating the project" });
            }
        }

        [HttpPut("{projectId}/employees/{employeeId}")]
        public async Task<IActionResult> AssignEmployeeToProject(int projectId, string employeeId)
        {
            try
            {
                _logger.LogInformation("Assigning employee {EmployeeId} to project {ProjectId}", employeeId, projectId);
                var project = await _projectService.GetByIdAsync(projectId);
                var employee = await _employeeService.GetByIdAsync(employeeId);

                if (project == null || employee == null)
                {
                    _logger.LogWarning("Project or Employee not found for assignment: ProjectId={ProjectId}, EmployeeId={EmployeeId}", projectId, employeeId);
                    return NotFound(new { Message = "Project or Employee not found" });
                }

                var allocation = new Allocation
                {
                    EmployeeId = employeeId,
                    ProjectId = projectId,
                    StartDate = DateTime.UtcNow
                };

                await _allocationService.AddAsync(allocation);
                _logger.LogInformation("Employee assigned to project: ProjectId={ProjectId}, EmployeeId={EmployeeId}", projectId, employeeId);

                return Ok($"Project {project.ProjectName} now has Employee {employee.Name}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning employee to project: ProjectId={ProjectId}, EmployeeId={EmployeeId}", projectId, employeeId);
                return StatusCode(500, new { Message = "An error occurred while assigning employee to project" });
            }
        }

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectDto dto)
        {
            try
            {
                _logger.LogInformation("Updating project: {ProjectId}", id);
                if (id != dto.ProjectId) return BadRequest(new { Message = "ID mismatch" });

                var entity = _mapper.Map<Project>(dto);
                await _projectService.UpdateAsync(entity);
                _logger.LogInformation("Project updated successfully: {ProjectId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project: {ProjectId}", id);
                return StatusCode(500, new { Message = "An error occurred while updating the project" });
            }
        }

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting project: {ProjectId}", id);
                await _projectService.DeleteAsync(id);
                _logger.LogInformation("Project deleted successfully: {ProjectId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project: {ProjectId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the project" });
            }
        }
    }
}