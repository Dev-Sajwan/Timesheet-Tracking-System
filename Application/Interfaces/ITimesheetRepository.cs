using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITimesheetRepository
    {
        Task<IEnumerable<Timesheet>> GetAllAsync();
        Task<Timesheet> GetByIdAsync(int id);
        Task<IEnumerable<Timesheet>> GetByEmployeeAndWeekAsync(int employeeId, DateTime weekStart);
        Task AddAsync(Timesheet timesheet);
        Task UpdateAsync(Timesheet timesheet);
        Task DeleteAsync(int id);

        // New methods
        //Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync(int managerId);
        Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync();
        Task<bool> ExistsForWeekAsync(int employeeId, DateTime weekStart);
    }

}
