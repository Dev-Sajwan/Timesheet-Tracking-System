
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
    [Authorize]
    public class HolidaysController : ControllerBase
    {
        private readonly IHolidayService _holidayService;
        private readonly IMapper _mapper;

        public HolidaysController(
            IHolidayService holidayService,
            IMapper mapper)
        {
            _holidayService = holidayService;
            _mapper = mapper;
        }

        // GET: api/holidays/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HolidayDto>> GetById(int id)
        {
            var holiday = await _holidayService.GetByIdAsync(id);

            if (holiday == null)
                return NotFound();

            return Ok(_mapper.Map<HolidayDto>(holiday));
        }

        // GET: api/holidays
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HolidayDto>>> GetAll()
        {
            var holidays = await _holidayService.GetAllAsync();

            return Ok(_mapper.Map<IEnumerable<HolidayDto>>(holidays));
        }

        // POST: api/holidays (Admin, Manager only)
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Add([FromBody] HolidayDto dto)
        {
            var holiday = _mapper.Map<Holiday>(dto);

            await _holidayService.AddAsync(holiday);

            return Ok("Holiday added successfully!");
        }

        // DELETE: api/holidays/{id} (Admin, Manager only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            await _holidayService.DeleteAsync(id);

            return NoContent();
        }
    }
}

