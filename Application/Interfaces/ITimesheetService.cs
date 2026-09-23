namespace Application.Interfaces
{
    using Domain.Entities;

    public interface ITimesheetService
    {
        void Submit(Timesheet timesheet);
        IEnumerable<Timesheet> GetByEmployee(int employeeId);
        IEnumerable<Timesheet> GetAll();
        void Approve(int timesheetId);
        void Delete(int timesheetId);
    }
}
