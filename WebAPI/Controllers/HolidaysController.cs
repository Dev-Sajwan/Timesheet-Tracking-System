using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HolidaysController : ControllerBase
    {
        private readonly IHolidayService _service;

        public HolidaysController(IHolidayService service) => _service = service;

        [HttpPost]
        public IActionResult Add(HolidayDto dto)
        {
            var holiday = new Holiday
            {
                Description = dto.Description,
                Date = dto.Date
            };
            _service.Add(holiday);
            return Ok("Holiday added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var holiday = _service.GetById(id);
            return holiday != null ? Ok(holiday) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Holiday deleted successfully!");
        }
    }
}