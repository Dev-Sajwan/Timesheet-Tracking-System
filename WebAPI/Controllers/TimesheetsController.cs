using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimesheetsController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;
        private readonly IMapper _mapper;

        public TimesheetsController(ITimesheetService timesheetService, IMapper mapper)
        {
            _timesheetService = timesheetService;
            _mapper = mapper;
        }

        // GET: api/Timesheet
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetAll()
        {
            var timesheets = await _timesheetService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<TimesheetDto>>(timesheets));
        }

        // GET: api/timesheets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TimesheetDto>> GetById(int id)
        {
            var timesheet = await _timesheetService.GetByIdAsync(id);
            if (timesheet == null) return NotFound();

            return Ok(MapToDto(timesheet));
        }

        // POST: api/timesheets
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TimesheetDto dto)
        {
            var entity = MapToEntity(dto);
            await _timesheetService.AddAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.TimesheetId }, dto);
        }

        // PUT: api/timesheets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TimesheetDto dto)
        {
            if (id != dto.TimesheetId) return BadRequest("ID mismatch");

            var entity = MapToEntity(dto);
            await _timesheetService.UpdateAsync(entity);
            return Ok("Timesheet Updated successfully!");
        }

        // DELETE: api/timesheets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _timesheetService.DeleteAsync(id);
            return Ok("Timesheet deleted successfully!");
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
