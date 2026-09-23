using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AllocationsController : ControllerBase
    {
        private readonly IAllocationService _service;

        public AllocationsController(IAllocationService service) => _service = service;

        [HttpPost]
        public IActionResult Add([FromBody] AllocationDto dto)
        {
            var allocation = new Allocation
            {
                EmployeeId = dto.EmployeeId,
                ProjectId = dto.ProjectId,
                AllocationPercent = dto.AllocationPercent,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            _service.Add(allocation);
            return Ok("Allocation added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var allocation = _service.GetById(id);
            return allocation != null ? Ok(allocation) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Allocation deleted successfully!");
        }
    }
}