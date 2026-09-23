using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _service;

        public ProjectsController(IProjectService service) => _service = service;

        [HttpPost]
        public IActionResult Add(ProjectDto dto)
        {
            var project = new Project
            {
                ClientId = dto.ClientId,
                ProjectName = dto.ProjectName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
            _service.Add(project);
            return Ok("Project added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var project = _service.GetById(id);
            return project != null ? Ok(project) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Project deleted successfully!");
        }
    }
}