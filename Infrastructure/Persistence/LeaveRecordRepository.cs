using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class LeaveRecordRepository : ILeaveRecordRepository
    {
        private readonly TimesheetDbContext _context;

        public LeaveRecordRepository(TimesheetDbContext context) => _context = context;

        public async Task AddAsync(LeaveRecord leaveRecord)
        {
            await _context.LeaveRecords.AddAsync(leaveRecord);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<LeaveRecord>> GetAllAsync() => await _context.LeaveRecords.ToListAsync();
        public async Task<LeaveRecord?> GetByIdAsync(int id) => await _context.LeaveRecords.FindAsync(id);

        public async Task DeleteAsync(int id)
        {
            var emp = await _context.LeaveRecords.FindAsync(id);
            if (emp != null)
            {
                _context.LeaveRecords.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }
    }
}
