using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveRecordDto>>> GetAll()
        {
            try
            {
                var records = await _leaveRecordService.GetAllAsync();
                var dtos = records.Select(r => new LeaveRecordDto
                {
                    LeaveRecordId = r.LeaveRecordId,
                    EmployeeId = r.EmployeeId,
                    LeaveTypeId = r.LeaveTypeId,
                    LeaveTypeName = r.LeaveType?.Name,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    TotalDays = r.TotalDays,
                    HalfDayType = r.HalfDayType,
                    Reason = r.Reason,
                    AttachmentPath = r.AttachmentPath,
                    Status = r.Status,
                    ApprovalStage = r.ApprovalStage,
                    RejectionReason = r.RejectionReason,
                    CreatedAt = r.CreatedAt,
                    EmployeeName = r.Employee != null ? r.Employee.Name : null
                });
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all leave records");
                return StatusCode(500, new { Message = "An error occurred while retrieving leave records" });
            }
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveRecordDto>>> GetByEmployee(string employeeId)
        {
            try
            {
                var records = await _leaveRecordService.GetByEmployeeIdAsync(employeeId);
                var dtos = records.Select(r => new LeaveRecordDto
                {
                    LeaveRecordId = r.LeaveRecordId,
                    EmployeeId = r.EmployeeId,
                    LeaveTypeId = r.LeaveTypeId,
                    LeaveTypeName = r.LeaveType?.Name,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    TotalDays = r.TotalDays,
                    HalfDayType = r.HalfDayType,
                    Reason = r.Reason,
                    AttachmentPath = r.AttachmentPath,
                    Status = r.Status,
                    ApprovalStage = r.ApprovalStage,
                    RejectionReason = r.RejectionReason,
                    CreatedAt = r.CreatedAt,
                    EmployeeName = r.Employee != null ? r.Employee.Name : null
                });
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting leave records for employee: {EmployeeId}", employeeId);
                return StatusCode(500, new { Message = "An error occurred while retrieving employee leave records" });
            }
        }

        [HttpPost("apply")]
        public async Task<ActionResult<LeaveRecordDto>> ApplyLeave([FromBody] LeaveRecordDto dto)
        {
            try
            {
                var record = new LeaveRecord
                {
                    EmployeeId = dto.EmployeeId,
                    LeaveTypeId = dto.LeaveTypeId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    HalfDayType = string.IsNullOrEmpty(dto.HalfDayType) ? "None" : dto.HalfDayType,
                    Reason = dto.Reason,
                    AttachmentPath = dto.AttachmentPath,
                    Hours = (int)(dto.TotalDays > 0 ? dto.TotalDays * 8 : 8)
                };
                

                var created = await _leaveRecordService.ApplyLeaveAsync(record);
                return Ok(new { Message = "Leave applied successfully!", LeaveRecordId = created.LeaveRecordId, TotalDays = created.TotalDays });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying leave");
                return StatusCode(500, new { Message = "An error occurred while applying for leave" });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelLeave(int id, [FromQuery] string employeeId)
        {
            try
            {
                await _leaveRecordService.CancelLeaveAsync(id, employeeId);
                return Ok(new { Message = "Leave request cancelled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling leave record: {Id}", id);
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("approve")]
        public async Task<IActionResult> ProcessApproval([FromBody] LeaveApprovalDto dto)
        {
            try
            {
                var record = await _leaveRecordService.GetByIdAsync(dto.LeaveRecordId);
                if (record == null) return NotFound(new { Message = "Leave record not found." });

                await _leaveRecordService.ProcessApprovalAsync(dto.LeaveRecordId, dto.Action, record.ApprovalStage, dto.RejectionReason);
                return Ok(new { Message = $"Leave request {dto.Action}ed successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing approval for leave record: {Id}", dto.LeaveRecordId);
                return StatusCode(500, new { Message = "An error occurred while processing the leave approval." });
            }
        }

        [HttpGet("balances/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveBalanceDto>>> GetBalances(string employeeId, [FromQuery] int year = 2026)
        {
            try
            {
                var balances = await _leaveRecordService.GetEmployeeBalancesAsync(employeeId, year);
                var dtos = balances.Select(b => new LeaveBalanceDto
                {
                    LeaveBalanceId = b.LeaveBalanceId,
                    EmployeeId = b.EmployeeId,
                    LeaveTypeId = b.LeaveTypeId,
                    LeaveTypeName = b.LeaveType?.Name,
                    Year = b.Year,
                    OpeningBalance = b.OpeningBalance,
                    CreditedBalance = b.CreditedBalance,
                    LeavesTaken = b.LeavesTaken,
                    ClosingBalance = b.ClosingBalance
                });
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving balances for employee: {EmployeeId}", employeeId);
                return StatusCode(500, new { Message = "An error occurred while retrieving leave balances." });
            }
        }

        [HttpPost("balances/adjust")]
        public async Task<IActionResult> AdjustBalance([FromBody] LeaveAdjustmentDto dto)
        {
            try
            {
                await _leaveRecordService.AdjustBalanceAsync(dto.EmployeeId, dto.LeaveTypeId, dto.Year, dto.AdjustmentAmount, dto.AdjustmentType);
                return Ok(new { Message = "Leave balance adjusted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adjusting leave balance");
                return StatusCode(500, new { Message = "An error occurred while adjusting leave balance." });
            }
        }

        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<LeaveType>>> GetLeaveTypes()
        {
            try
            {
                var types = await _leaveRecordService.GetLeaveTypesAsync();
                return Ok(types);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leave types");
                return StatusCode(500, new { Message = "An error occurred while retrieving leave types." });
            }
        }

        [HttpPut("types/{id}/quota")]
        public async Task<IActionResult> UpdateLeaveTypeQuota(int id, [FromBody] decimal defaultQuota)
        {
            try
            {
                await _leaveRecordService.UpdateLeaveTypeQuotaAsync(id, defaultQuota);
                return Ok(new { Message = "Leave type quota updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leave type quota");
                return StatusCode(500, new { Message = "An error occurred while updating the leave quota." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _leaveRecordService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting leave record: {Id}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the leave record" });
            }
        }
    }
}
