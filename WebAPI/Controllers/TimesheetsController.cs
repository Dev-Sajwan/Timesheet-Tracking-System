using Application.DTOs;
using Application.Interfaces;
using Application.Services;
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
    public class TimesheetsController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;
        private readonly IMapper _mapper;
        private readonly ILogger<TimesheetsController> _logger;

        public TimesheetsController(ITimesheetService timesheetService, IMapper mapper, ILogger<TimesheetsController> logger)
        {
            _timesheetService = timesheetService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/Timesheet
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all timesheets");
                var timesheets = await _timesheetService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<TimesheetDto>>(timesheets));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all timesheets");
                return StatusCode(500, new { Message = "An error occurred while retrieving timesheets" });
            }
        }

        // GET: api/timesheets/employee/{employeeId}
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetByEmployee(string employeeId)
        {
            try
            {
                _logger.LogInformation("Getting timesheets for employee: {EmployeeId}", employeeId);
                var timesheets = await _timesheetService.GetByEmployeeAsync(employeeId);
                return Ok(_mapper.Map<IEnumerable<TimesheetDto>>(timesheets));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for employee: {EmployeeId}", employeeId);
                return StatusCode(500, new { Message = "An error occurred while retrieving timesheets" });
            }
        }

        // GET: api/timesheets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TimesheetDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting timesheet by ID: {TimesheetId}", id);
                var timesheet = await _timesheetService.GetByIdAsync(id);
                if (timesheet == null)
                {
                    _logger.LogWarning("Timesheet not found: {TimesheetId}", id);
                    return NotFound(new { Message = "Timesheet not found" });
                }

                return Ok(MapToDto(timesheet));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet by ID: {TimesheetId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the timesheet" });
            }
        }

        // POST: api/timesheets
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TimesheetDto dto)
        {
            try
            {
                _logger.LogInformation("Creating new timesheet for employee: {EmployeeId}", dto.EmployeeId);
                var entity = MapToEntity(dto);
                await _timesheetService.AddAsync(entity);
                _logger.LogInformation("Timesheet created successfully: {TimesheetId}", entity.TimesheetId);
                return CreatedAtAction(nameof(GetById), new { id = entity.TimesheetId }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating timesheet for employee: {EmployeeId}", dto.EmployeeId);
                return StatusCode(500, new { Message = "An error occurred while creating the timesheet" });
            }
        }

        // PUT: api/timesheets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TimesheetDto dto)
        {
            try
            {
                _logger.LogInformation("Updating timesheet: {TimesheetId}", id);
                if (id != dto.TimesheetId) return BadRequest(new { Message = "ID mismatch" });

                var entity = MapToEntity(dto);
                await _timesheetService.UpdateAsync(entity);
                _logger.LogInformation("Timesheet updated successfully: {TimesheetId}", id);
                return Ok(new { Message = "Timesheet Updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating timesheet: {TimesheetId}", id);
                return StatusCode(500, new { Message = "An error occurred while updating the timesheet" });
            }
        }

        // DELETE: api/timesheets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting timesheet: {TimesheetId}", id);
                await _timesheetService.DeleteAsync(id);
                _logger.LogInformation("Timesheet deleted successfully: {TimesheetId}", id);
                return Ok(new { Message = "Timesheet deleted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting timesheet: {TimesheetId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the timesheet" });
            }
        }

        // PUT: api/timesheets/approve/{id}
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveTimesheetDto dto)
        {
            try
            {
                _logger.LogInformation("Approving/rejecting timesheet: {TimesheetId}, Status: {Status}", id, dto.ApprovalStatus);
                var timesheet = await _timesheetService.GetByIdAsync(id);
                if (timesheet == null) 
                {
                    _logger.LogWarning("Timesheet not found for approval: {TimesheetId}", id);
                    return NotFound(new { Message = "Timesheet not found." });
                }

                timesheet.Approvals ??= new List<Approval>();
                timesheet.ApprovalStatus = dto.ApprovalStatus; // "Approved" or "Rejected"
                timesheet.Approvals.Add(new Approval
                {
                    TimesheetId = id,
                    ApprovedBy = User.FindFirst("uid")?.Value ?? "Unknown",
                    ApprovalDate = DateTime.UtcNow,
                    ApprovalType = dto.ApprovalStatus
                });
                
                await _timesheetService.UpdateAsync(timesheet);
                _logger.LogInformation("Timesheet {Status} successfully: {TimesheetId}", dto.ApprovalStatus, id);
                return Ok(new { Message = $"Timesheet {dto.ApprovalStatus.ToLower()}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving/rejecting timesheet: {TimesheetId}", id);
                return StatusCode(500, new { Message = "An error occurred while processing the approval" });
            }
        }

        // Helper mapping methods
        private TimesheetDto MapToDto(Timesheet entity) =>
            new TimesheetDto
            {
                TimesheetId = entity.TimesheetId,
                EmployeeId = entity.EmployeeId,
                ProjectId = entity.ProjectId,
                Date = entity.Date,
                HoursWorked = entity.HoursWorked,
                SubmissionType = entity.SubmissionType,
                ApprovalStatus = entity.ApprovalStatus,
                WeekStartDate = entity.WeekStartDate,
                WeekEndDate = entity.WeekEndDate,
                Entries = entity.Entries?.Select(e => new TimesheetEntryDto
                {
                    Id = e.Id,
                    TimesheetId = e.TimesheetId,
                    Date = e.Date,
                    Hours = e.Hours,
                    Description = e.Description
                }).ToList() ?? new List<TimesheetEntryDto>(),
                Approvals = entity.Approvals?.Select(a => new ApprovalDto
                {
                    ApprovalId = a.ApprovalId,
                    TimesheetId = a.TimesheetId,
                    ApprovedBy = a.ApprovedBy,
                    ApprovalDate = a.ApprovalDate,
                    ApprovalType = a.ApprovalType
                }).ToList() ?? new List<ApprovalDto>()
            };

        private Timesheet MapToEntity(TimesheetDto dto) =>
            new Timesheet
            {
                TimesheetId = dto.TimesheetId,
                EmployeeId = dto.EmployeeId,
                ProjectId = dto.ProjectId,
                Date = dto.Date,
                HoursWorked = dto.HoursWorked,
                SubmissionType = dto.SubmissionType,
                ApprovalStatus = dto.ApprovalStatus,
                WeekStartDate = dto.WeekStartDate,
                WeekEndDate = dto.WeekEndDate,
                Entries = dto.Entries?.Select(e => new TimesheetEntry
                {
                    Id = e.Id,
                    TimesheetId = e.TimesheetId,
                    Date = e.Date,
                    Hours = e.Hours,
                    Description = e.Description
                }).ToList() ?? new List<TimesheetEntry>(),
                Approvals = dto.Approvals?.Select(a => new Approval
                {
                    ApprovalId = a.ApprovalId,
                    TimesheetId = a.TimesheetId,
                    ApprovedBy = a.ApprovedBy,
                    ApprovalDate = a.ApprovalDate,
                    ApprovalType = a.ApprovalType
                }).ToList() ?? new List<Approval>()
            };
    }
}