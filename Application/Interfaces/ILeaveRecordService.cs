using Domain.Entities;

namespace Application.Interfaces;

public interface ILeaveRecordService
{
    Task<IEnumerable<LeaveRecord>> GetAllAsync();
    Task<IEnumerable<LeaveRecord>> GetByEmployeeIdAsync(string employeeId);
    Task<LeaveRecord?> GetByIdAsync(int id);
    Task<LeaveRecord> ApplyLeaveAsync(LeaveRecord leaveRecord);
    Task CancelLeaveAsync(int id, string employeeId);
    Task ProcessApprovalAsync(int id, string action, string approvalStage, string? rejectionReason);
    Task<IEnumerable<LeaveBalance>> GetEmployeeBalancesAsync(string employeeId, int year);
    Task AdjustBalanceAsync(string employeeId, int leaveTypeId, int year, decimal adjustmentAmount, string adjustmentType);
    Task<IEnumerable<LeaveType>> GetLeaveTypesAsync();
    Task UpdateLeaveTypeQuotaAsync(int leaveTypeId, decimal defaultQuota);
    Task DeleteAsync(int id);
}
