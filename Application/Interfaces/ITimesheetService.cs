using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITimesheetService
    {
        Task<IEnumerable<Timesheet>> GetAllAsync();
        Task<Timesheet> GetByIdAsync(int id);
        Task<IEnumerable<Timesheet>> GetByEmployeeAndWeekAsync(string employeeId, DateTime weekStart);
        Task<IEnumerable<Timesheet>> GetByEmployeeAsync(string employeeId);
        Task AddAsync(Timesheet timesheet);
        Task UpdateAsync(Timesheet timesheet);
        Task DeleteAsync(int id);

        // Approval workflow methods
        Task SubmitAsync(int id);
        Task ApproveAsync(int id);
        Task RejectAsync(int id);
    }
}
