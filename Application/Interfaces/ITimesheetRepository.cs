using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITimesheetRepository
    {
        void Add(Timesheet timesheet);
        IEnumerable<Timesheet> GetByEmployee(int employeeId);
        IEnumerable<Timesheet> GetAll();
        void Approve(int timesheetId);
        void Delete(int timesheetId);
    }
}
