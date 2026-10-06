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
    public class AllocationsController : ControllerBase
    {
        private readonly IAllocationService _allocationService;
        private readonly IMapper _mapper;
        private readonly ILogger<AllocationsController> _logger;

        public AllocationsController(
            IAllocationService allocationService,
            IMapper mapper,
            ILogger<AllocationsController> logger)
        {
            _allocationService = allocationService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/allocations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AllocationDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all allocations");
                var allocations = await _allocationService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<AllocationDto>>(allocations));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all allocations");
                return StatusCode(500, new { Message = "An error occurred while retrieving allocations" });
            }
        }

        // GET: api/allocations/employee/{employeeId}
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<AllocationDto>>> GetByEmployee(string employeeId)
        {
            try
            {
                _logger.LogInformation("Getting allocations for employee: {EmployeeId}", employeeId);
                var allocations = await _allocationService.GetByEmployeeAndProjectAsync(employeeId);
                return Ok(_mapper.Map<IEnumerable<AllocationDto>>(allocations));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting allocations for employee: {EmployeeId}", employeeId);
                return StatusCode(500, new { Message = "An error occurred while retrieving allocations" });
            }
        }

        // GET: api/allocations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AllocationDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting allocation by ID: {AllocationId}", id);
                var allocation = await _allocationService.GetByIdAsync(id);

                if (allocation == null)
                {
                    _logger.LogWarning("Allocation not found: {AllocationId}", id);
                    return NotFound(new { Message = "Allocation not found" });
                }

                return Ok(_mapper.Map<AllocationDto>(allocation));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting allocation by ID: {AllocationId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the allocation" });
            }
        }

        // POST: api/allocations
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AllocationDto dto)
        {
            try
            {
                _logger.LogInformation("Adding new allocation for employee: {EmployeeId}, project: {ProjectId}", dto.EmployeeId, dto.ProjectId);
                var allocation = _mapper.Map<Allocation>(dto);
                await _allocationService.AddAsync(allocation);
                _logger.LogInformation("Allocation added successfully");
                return Ok(new { Message = "Allocation added successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding allocation");
                return StatusCode(500, new { Message = "An error occurred while adding the allocation" });
            }
        }

        // DELETE: api/allocations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting allocation: {AllocationId}", id);
                await _allocationService.DeleteAsync(id);
                _logger.LogInformation("Allocation deleted successfully: {AllocationId}", id);
                return Ok(new { Message = "Allocation deleted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting allocation: {AllocationId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the allocation" });
            }
        }
    }
}