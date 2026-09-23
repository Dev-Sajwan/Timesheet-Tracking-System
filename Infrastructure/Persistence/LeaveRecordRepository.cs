using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class LeaveRecordRepository : ILeaveRecordRepository
    {
        private readonly TimesheetDbContext _context;

        public LeaveRecordRepository(TimesheetDbContext context) => _context = context;

        public void Add(LeaveRecord leaveRecord)
        {
            _context.LeaveRecords.Add(leaveRecord);
            _context.SaveChanges();
        }

        public IEnumerable<LeaveRecord> GetAll() => _context.LeaveRecords.ToList();
        public LeaveRecord? GetById(int id) => _context.LeaveRecords.Find(id);

        public void Delete(int id)
        {
            var emp = _context.LeaveRecords.Find(id);
            if (emp != null)
            {
                _context.LeaveRecords.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
