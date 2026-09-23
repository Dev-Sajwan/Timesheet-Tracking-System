using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class TimesheetRepository : ITimesheetRepository
    {
        private readonly TimesheetDbContext _context;

        public TimesheetRepository(TimesheetDbContext context) => _context = context;

        public void Add(Timesheet timesheet)
        {
            _context.Timesheets.Add(timesheet);
            _context.SaveChanges();
        }

        public IEnumerable<Timesheet> GetByEmployee(int employeeId) =>
            _context.Timesheets.Where(t => t.EmployeeId == employeeId).ToList();

        public IEnumerable<Timesheet> GetAll() => _context.Timesheets.ToList();

        public void Approve(int timesheetId)
        {
            var ts = _context.Timesheets.Find(timesheetId);
            if (ts != null)
            {
                ts.ApprovalStatus = "Approved";
                _context.SaveChanges();
            }
        }

        public void Delete(int timesheetId)
        {
            var ts = _context.Timesheets.Find(timesheetId);
            if (ts != null)
            {
                _context.Timesheets.Remove(ts);
                _context.SaveChanges();
            }
        }
    }
}
