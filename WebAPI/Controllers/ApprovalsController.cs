using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApprovalsController : ControllerBase
    {
        private readonly IApprovalService _approvalService;
        private readonly ILogger<ApprovalsController> _logger;

        public ApprovalsController(IApprovalService approvalService, ILogger<ApprovalsController> logger)
        {
            _approvalService = approvalService;
            _logger = logger;
        }

        // GET: api/approvals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all approvals");
                
                // Get current user's role from token
                var currentUserRole = User.FindFirst("role")?.Value 
                    ?? User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                
                // Check if user is System Admin (profile-based)
                var isSystemAdmin = User.FindFirst("isSystemAdmin")?.Value?.ToLower() == "true";
                
                // If System Admin, bypass role filtering
                string roleForFiltering = isSystemAdmin ? "" : currentUserRole;
                
                var approvals = await _approvalService.GetAllAsync(roleForFiltering);
                return Ok(approvals.Select(MapToDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all approvals");
                return StatusCode(500, new { Message = "An error occurred while retrieving approvals" });
            }
        }

        // GET: api/approvals/timesheet/{timesheetId}
        [HttpGet("timesheet/{timesheetId}")]
        public async Task<ActionResult<ApprovalDto>> GetByTimesheetId(int timesheetId)
        {
            try
            {
                _logger.LogInformation("Getting approval for timesheet: {TimesheetId}", timesheetId);
                var approval = await _approvalService.GetByTimesheetIdAsync(timesheetId);
                if (approval == null)
                {
                    _logger.LogWarning("Approval not found for timesheet: {TimesheetId}", timesheetId);
                    return NotFound(new { Message = "Approval not found" });
                }

                return Ok(MapToDto(approval));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting approval for timesheet: {TimesheetId}", timesheetId);
                return StatusCode(500, new { Message = "An error occurred while retrieving the approval" });
            }
        }

        // POST: api/approvals/{timesheetId}/submit
        [HttpPost("{timesheetId}/submit")]
        public async Task<IActionResult> Submit(int timesheetId, [FromQuery] string approvalType = "Manual")
        {
            try
            {
                _logger.LogInformation("Submitting timesheet for approval: {TimesheetId}", timesheetId);
                await _approvalService.SubmitAsync(timesheetId, approvalType);
                _logger.LogInformation("Timesheet submitted for approval: {TimesheetId}", timesheetId);
                return Ok(new { Message = "Timesheet submitted for approval" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting timesheet for approval: {TimesheetId}", timesheetId);
                return StatusCode(500, new { Message = "An error occurred while submitting for approval" });
            }
        }

        // POST: api/approvals/{timesheetId}/approve
        [HttpPost("{timesheetId}/approve")]
        [Authorize]
        public async Task<IActionResult> Approve(int timesheetId, [FromQuery] string approverName, [FromQuery] string approvedDescription, [FromQuery] string approvalType = "Manual")
        {
            try
            {
                _logger.LogInformation("Approving timesheet: {TimesheetId} by {ApproverName}", timesheetId, approverName);
                await _approvalService.ApproveAsync(timesheetId, approverName, approvedDescription, approvalType);
                _logger.LogInformation("Timesheet approved: {TimesheetId}", timesheetId);
                return Ok(new { Message = "Timesheet approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving timesheet: {TimesheetId}", timesheetId);
                return StatusCode(500, new { Message = "An error occurred while approving the timesheet" });
            }
        }

        // POST: api/approvals/{timesheetId}/reject
        [HttpPost("{timesheetId}/reject")]
        [Authorize]
        public async Task<IActionResult> Reject(int timesheetId, [FromQuery] string approverName, [FromQuery] string approvedDescription, [FromQuery] string approvalType = "Manual")
        {
            try
            {
                _logger.LogInformation("Rejecting timesheet: {TimesheetId} by {ApproverName}", timesheetId, approverName);
                await _approvalService.RejectAsync(timesheetId, approverName, approvedDescription, approvalType);
                _logger.LogInformation("Timesheet rejected: {TimesheetId}", timesheetId);
                return Ok(new { Message = "Timesheet rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting timesheet: {TimesheetId}", timesheetId);
                return StatusCode(500, new { Message = "An error occurred while rejecting the timesheet" });
            }
        }

        // Helper mapping
        private ApprovalDto MapToDto(Approval entity) =>
            new ApprovalDto
            {
                ApprovalId = entity.ApprovalId,
                TimesheetId = entity.TimesheetId,
                ApprovedBy = entity.ApprovedBy,
                ApprovalDate = entity.ApprovalDate,
                ApprovalType = entity.ApprovalType,
                Description = entity.Description
            };
    }
}