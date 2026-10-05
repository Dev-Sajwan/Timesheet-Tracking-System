using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AllocationsController : ControllerBase
    {
        private readonly IAllocationService _allocationService;
        private readonly IMapper _mapper;

        public AllocationsController(
            IAllocationService allocationService,
            IMapper mapper)
        {
            _allocationService = allocationService;
            _mapper = mapper;
        }

        // GET: api/allocations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AllocationDto>>> GetAll()
        {
            var allocations = await _allocationService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<AllocationDto>>(allocations));
        }

        // GET: api/allocations/employee/{employeeId}
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<AllocationDto>>> GetByEmployee(string employeeId)
        {
            var allocations = await _allocationService.GetByEmployeeAndProjectAsync(employeeId);
            return Ok(_mapper.Map<IEnumerable<AllocationDto>>(allocations));
        }

        // GET: api/allocations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AllocationDto>> GetById(int id)
        {
            var allocation = await _allocationService.GetByIdAsync(id);

            if (allocation == null)
                return NotFound();

            return Ok(_mapper.Map<AllocationDto>(allocation));
        }

        // POST: api/allocations
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AllocationDto dto)
        {
            var allocation = _mapper.Map<Allocation>(dto);

            await _allocationService.AddAsync(allocation);

            return Ok("Allocation added successfully!");
        }

        // DELETE: api/allocations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _allocationService.DeleteAsync(id);
            return Ok("Allocation deleted successfully!");
        }
    }
}