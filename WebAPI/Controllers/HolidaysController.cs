using Application.DTOs;
using Application.Interfaces;
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
    public class HolidaysController : ControllerBase
    {
        private readonly IHolidayService _holidayService;
        private readonly IMapper _mapper;
        private readonly ILogger<HolidaysController> _logger;

        public HolidaysController(
            IHolidayService holidayService,
            IMapper mapper,
            ILogger<HolidaysController> logger)
        {
            _holidayService = holidayService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/holidays/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HolidayDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting holiday by ID: {HolidayId}", id);
                var holiday = await _holidayService.GetByIdAsync(id);

                if (holiday == null)
                {
                    _logger.LogWarning("Holiday not found: {HolidayId}", id);
                    return NotFound(new { Message = "Holiday not found" });
                }

                return Ok(_mapper.Map<HolidayDto>(holiday));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting holiday by ID: {HolidayId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the holiday" });
            }
        }

        // GET: api/holidays
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HolidayDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all holidays");
                var holidays = await _holidayService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<HolidayDto>>(holidays));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all holidays");
                return StatusCode(500, new { Message = "An error occurred while retrieving holidays" });
            }
        }

        // POST: api/holidays (Admin, Manager only)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Add([FromBody] HolidayDto dto)
        {
            try
            {
                _logger.LogInformation("Adding new holiday: {Date}", dto.Date);
                var holiday = _mapper.Map<Holiday>(dto);
                await _holidayService.AddAsync(holiday);
                _logger.LogInformation("Holiday added successfully: {HolidayId}", holiday.HolidayId);
                return Ok(new { Message = "Holiday added successfully!", HolidayId = holiday.HolidayId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding holiday");
                return StatusCode(500, new { Message = "An error occurred while adding the holiday" });
            }
        }

        // DELETE: api/holidays/{id} (Admin, Manager only)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting holiday: {HolidayId}", id);
                await _holidayService.DeleteAsync(id);
                _logger.LogInformation("Holiday deleted successfully: {HolidayId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting holiday: {HolidayId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the holiday" });
            }
        }
    }
}