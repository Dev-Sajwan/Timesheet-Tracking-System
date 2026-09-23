using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class TimesheetService : ITimesheetService
    {
        private readonly ITimesheetRepository _repository;

        public TimesheetService(ITimesheetRepository repository)
        {
            _repository = repository;
        }

        public void Submit(Timesheet timesheet) => _repository.Add(timesheet);

        public IEnumerable<Timesheet> GetByEmployee(int employeeId) => _repository.GetByEmployee(employeeId);

        public IEnumerable<Timesheet> GetAll() => _repository.GetAll();

        public void Approve(int timesheetId) => _repository.Approve(timesheetId);

        public void Delete(int timesheetId) => _repository.Delete(timesheetId);
    }
}
