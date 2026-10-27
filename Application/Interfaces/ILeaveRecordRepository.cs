using Domain.Entities;

namespace Application.Interfaces
{
    public interface ILeaveRecordRepository
    {
        Task AddAsync(LeaveRecord leaveRecord);
        Task<IEnumerable<LeaveRecord>> GetAllAsync();
        Task<IEnumerable<LeaveRecord>> GetByEmployeeIdAsync(string employeeId);
        Task<LeaveRecord?> GetByIdAsync(int id);
        Task UpdateAsync(LeaveRecord leaveRecord);
        Task DeleteAsync(int id);
    }

    public interface ILeaveBalanceRepository
    {
        Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(string employeeId, int year);
        Task<LeaveBalance?> GetAsync(string employeeId, int leaveTypeId, int year);
        Task AddAsync(LeaveBalance leaveBalance);
        Task UpdateAsync(LeaveBalance leaveBalance);
        Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync();
    }
}
