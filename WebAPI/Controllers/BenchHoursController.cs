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
    public class BenchHoursController : ControllerBase
    {
        private readonly IBenchHourService _benchHourService;
        private readonly IMapper _mapper;
        private readonly ILogger<BenchHoursController> _logger;

        public BenchHoursController(
            IBenchHourService benchHourService,
            IMapper mapper,
            ILogger<BenchHoursController> logger)
        {
            _benchHourService = benchHourService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/benchhours/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BenchHourDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting bench hour by ID: {BenchHourId}", id);
                var benchHour = await _benchHourService.GetByIdAsync(id);

                if (benchHour == null)
                {
                    _logger.LogWarning("Bench hour not found: {BenchHourId}", id);
                    return NotFound(new { Message = "Bench hour not found" });
                }

                return Ok(_mapper.Map<BenchHourDto>(benchHour));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bench hour by ID: {BenchHourId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the bench hour" });
            }
        }

        // GET: api/benchhours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenchHourDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all bench hours");
                var benchHours = await _benchHourService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<BenchHourDto>>(benchHours));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all bench hours");
                return StatusCode(500, new { Message = "An error occurred while retrieving bench hours" });
            }
        }

        // POST: api/benchhours
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] BenchHourDto dto)
        {
            try
            {
                _logger.LogInformation("Adding new bench hour for employee: {EmployeeId}", dto.EmployeeId);
                var benchHour = _mapper.Map<BenchHour>(dto);
                await _benchHourService.AddAsync(benchHour);
                _logger.LogInformation("Bench hour record added successfully");
                return Ok(new { Message = "Bench hour record added successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding bench hour");
                return StatusCode(500, new { Message = "An error occurred while adding the bench hour" });
            }
        }

        // DELETE: api/benchhours/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting bench hour: {BenchHourId}", id);
                await _benchHourService.DeleteAsync(id);
                _logger.LogInformation("Bench hour deleted successfully: {BenchHourId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting bench hour: {BenchHourId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the bench hour" });
            }
        }
    }
}