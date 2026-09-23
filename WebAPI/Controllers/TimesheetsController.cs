using Application.Interfaces;
using Domain.Entities;
using WebAPI.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimesheetsController : ControllerBase
    {
        private readonly ITimesheetService _service;

        public TimesheetsController(ITimesheetService service) => _service = service;

        [HttpPost("submit")]
        public IActionResult Submit([FromBody] TimesheetDto dto)
        {
            // Map DTO → Domain entity
            var timesheet = new Timesheet
            {
                EmployeeId = dto.EmployeeId,
                ProjectId = dto.ProjectId,
                Date = dto.Date,
                HoursWorked = dto.HoursWorked,
                SubmissionType = dto.SubmissionType,
                ApprovalStatus = dto.ApprovalStatus
            };
            _service.Submit(timesheet);
            return Ok("Timesheet submitted successfully!");
        }

        [HttpGet("{employeeId}")]
        public IActionResult GetByEmployee(int employeeId) => Ok(_service.GetByEmployee(employeeId));

        [HttpGet("all")]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpPut("approve/{id}")]
        public IActionResult Approve(int id)
        {
            _service.Approve(id);
            return Ok("Timesheet approved!");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Timesheet deleted!");
        }
    }
}
