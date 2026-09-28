using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalsController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalsController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        // GET: api/approvals/timesheet/{timesheetId}
        [HttpGet("timesheet/{timesheetId}")]
        public async Task<ActionResult<ApprovalDto>> GetByTimesheetId(int timesheetId)
        {
            var approval = await _approvalService.GetByTimesheetIdAsync(timesheetId);
            if (approval == null) return NotFound();

            return Ok(MapToDto(approval));
        }

        // POST: api/approvals/{timesheetId}/submit
        [HttpPost("{timesheetId}/submit")]
        public async Task<IActionResult> Submit(int timesheetId, [FromQuery] string approvalType = "Manual")
        {
            await _approvalService.SubmitAsync(timesheetId, approvalType);
            return Ok(new { Message = "Timesheet submitted for approval" });
        }

        // POST: api/approvals/{timesheetId}/approve
        [HttpPost("{timesheetId}/approve")]
        public async Task<IActionResult> Approve(int timesheetId, [FromQuery] string approverName, [FromQuery] string approvalType = "Manual")
        {
            await _approvalService.ApproveAsync(timesheetId, approverName, approvalType);
            return Ok(new { Message = "Timesheet approved successfully" });
        }

        // POST: api/approvals/{timesheetId}/reject
        [HttpPost("{timesheetId}/reject")]
        public async Task<IActionResult> Reject(int timesheetId, [FromQuery] string approverName, [FromQuery] string approvalType = "Manual")
        {
            await _approvalService.RejectAsync(timesheetId, approverName, approvalType);
            return Ok(new { Message = "Timesheet rejected successfully" });
        }

        // Helper mapping
        private ApprovalDto MapToDto(Approval entity) =>
            new ApprovalDto
            {
                ApprovalId = entity.ApprovalId,
                TimesheetId = entity.TimesheetId,
                ApprovedBy = entity.ApprovedBy,
                ApprovalDate = entity.ApprovalDate,
                ApprovalType = entity.ApprovalType
            };
    }
}
