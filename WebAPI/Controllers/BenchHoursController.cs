
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BenchHoursController : ControllerBase
    {
        private readonly IBenchHourService _benchHourService;
        private readonly IMapper _mapper;

        public BenchHoursController(
            IBenchHourService benchHourService,
            IMapper mapper)
        {
            _benchHourService = benchHourService;
            _mapper = mapper;
        }

        // GET: api/benchhours/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BenchHourDto>> GetById(int id)
        {
            var benchHour = await _benchHourService.GetByIdAsync(id);

            if (benchHour == null)
                return NotFound();

            return Ok(_mapper.Map<BenchHourDto>(benchHour));
        }

        // GET: api/benchhours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenchHourDto>>> GetAll()
        {
            var benchHours = await _benchHourService.GetAllAsync();

            return Ok(_mapper.Map<IEnumerable<BenchHourDto>>(benchHours));
        }

        // POST: api/benchhours
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] BenchHourDto dto)
        {
            var benchHour = _mapper.Map<BenchHour>(dto);

            await _benchHourService.AddAsync(benchHour);

            return Ok("Bench hour record added successfully!");
        }

        // DELETE: api/benchhours/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _benchHourService.DeleteAsync(id);

            return NoContent();
        }
    }
}
