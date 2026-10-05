using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITimesheetRepository
    {
        Task<IEnumerable<Timesheet>> GetAllAsync();
        Task<Timesheet> GetByIdAsync(int id);
        Task<IEnumerable<Timesheet>> GetByEmployeeAndWeekAsync(string employeeId, DateTime weekStart);
        Task<IEnumerable<Timesheet>> GetByEmployeeAsync(string employeeId);
        Task AddAsync(Timesheet timesheet);
        Task UpdateAsync(Timesheet timesheet);
        Task DeleteAsync(int id);

        // New methods
        //Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync(int managerId);
        Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync();
        Task<bool> ExistsForWeekAsync(string employeeId, DateTime weekStart);
    }

}
