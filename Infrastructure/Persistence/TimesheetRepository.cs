using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;

namespace Infrastructure.Persistence
{
    public class TimesheetRepository : ITimesheetRepository
    {
        private readonly TimesheetDbContext _context;
        public ICollection<TimesheetEntry> Entries { get; set; } = new List<TimesheetEntry>();

        public TimesheetRepository(TimesheetDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Timesheet>> GetAllAsync()
        {
            return await _context.Timesheets
                //.Include(p => p.Allocations)
                //.Include(p => p.Timesheets)
                .Include(t=> t.Entries)
                .ToListAsync();
        }
        public async Task<Timesheet> GetByIdAsync(int id) =>
            await _context.Timesheets
                .Include(t => t.Entries)
                .FirstOrDefaultAsync(t => t.TimesheetId == id);

        public async Task<IEnumerable<Timesheet>> GetByEmployeeAndWeekAsync(int employeeId, DateTime weekStart) =>
            await _context.Timesheets
                .Where(t => t.EmployeeId == employeeId && t.WeekStartDate == weekStart)
                .Include(t => t.Entries)
                .ToListAsync();

        public async Task AddAsync(Timesheet timesheet)
        {
            await _context.Timesheets.AddAsync(timesheet);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Timesheet timesheet)
        {
            _context.Timesheets.Update(timesheet);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var timesheet = await _context.Timesheets.FindAsync(id);
            if (timesheet != null)
            {
                _context.Timesheets.Remove(timesheet);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync() =>
            await _context.Timesheets
                .Where(t => t.ApprovalStatus == "Submitted")
                .Include(t => t.Entries)
                .ToListAsync();

        //public async Task<IEnumerable<Timesheet>> GetPendingApprovalsAsync(int managerId) =>
        //    await _context.Timesheets
        //        .Where(t => t.ApprovalStatus == "Submitted" && t.Employee.ManagerId == managerId)
        //        .Include(t => t.Entries)
        //        .ToListAsync();

        public async Task<bool> ExistsForWeekAsync(int employeeId, DateTime weekStart) =>
            await _context.Timesheets.AnyAsync(t => t.EmployeeId == employeeId && t.WeekStartDate == weekStart);
    }

}
