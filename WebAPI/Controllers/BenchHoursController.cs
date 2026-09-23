using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BenchHoursController : ControllerBase
    {
        private readonly IBenchHourService _service;

        public BenchHoursController(IBenchHourService service) => _service = service;

        [HttpPost]
        public IActionResult Add(BenchHourDto dto)
        {
            var benchHour = new BenchHour
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                Hours = dto.Hours,
                Description = dto.Description
            };
            _service.Add(benchHour);
            return Ok("Bench hour record added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var benchHour = _service.GetById(id);
            return benchHour != null ? Ok(benchHour) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Bench hour record deleted successfully!");
        }
    }
}