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
    public class LeaveRecordsController : ControllerBase
    {
        private readonly ILeaveRecordService _leaveRecordService;
        private readonly IMapper _mapper;
        private readonly ILogger<LeaveRecordsController> _logger;

        public LeaveRecordsController(
            ILeaveRecordService leaveRecordService,
            IMapper mapper,
            ILogger<LeaveRecordsController> logger)
        {
            _leaveRecordService = leaveRecordService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/leaverecords/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveRecordDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting leave record by ID: {LeaveRecordId}", id);
                var leaveRecord = await _leaveRecordService.GetByIdAsync(id);

                if (leaveRecord == null)
                {
                    _logger.LogWarning("Leave record not found: {LeaveRecordId}", id);
                    return NotFound(new { Message = "Leave record not found" });
                }

                return Ok(_mapper.Map<LeaveRecordDto>(leaveRecord));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting leave record by ID: {LeaveRecordId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the leave record" });
            }
        }

        // GET: api/leaverecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveRecordDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all leave records");
                var leaveRecords = await _leaveRecordService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<LeaveRecordDto>>(leaveRecords));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all leave records");
                return StatusCode(500, new { Message = "An error occurred while retrieving leave records" });
            }
        }

        // POST: api/leaverecords
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] LeaveRecordDto dto)
        {
            try
            {
                _logger.LogInformation("Adding new leave record for employee: {EmployeeId}", dto.EmployeeId);
                var leaveRecord = _mapper.Map<LeaveRecord>(dto);
                await _leaveRecordService.AddAsync(leaveRecord);
                _logger.LogInformation("Leave record added successfully");
                return Ok(new { Message = "Leave record added successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding leave record");
                return StatusCode(500, new { Message = "An error occurred while adding the leave record" });
            }
        }

        // DELETE: api/leaverecords/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting leave record: {LeaveRecordId}", id);
                await _leaveRecordService.DeleteAsync(id);
                _logger.LogInformation("Leave record deleted successfully: {LeaveRecordId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting leave record: {LeaveRecordId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the leave record" });
            }
        }
    }
}