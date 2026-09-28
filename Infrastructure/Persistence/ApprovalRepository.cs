using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class ApprovalRepository : IApprovalRepository
    {
        private readonly TimesheetDbContext _context;

        public ApprovalRepository(TimesheetDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Approval approval)
        {
            _context.Approvals.AddAsync(approval);
            _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Approval>> GetAllAsync()
        {
            return await _context.Approvals.ToListAsync();
        }

        public async Task<Approval?> GetByIdAsync(int id)
        {
            return await _context.Approvals.FindAsync(id);
        }

        public async Task DeleteAsync(int id)
        {
            var approval = await _context.Approvals.FindAsync(id);
            if (approval != null)
            {
                _context.Approvals.Remove(approval);
                await _context.SaveChangesAsync();
            }
        }

        // New methods
        public async Task<Approval> GetByTimesheetIdAsync(int timesheetId)
        {
            return await _context.Approvals
                .FirstOrDefaultAsync(a => a.TimesheetId == timesheetId);
        }

        public async Task UpdateAsync(Approval approval)
        {
            _context.Approvals.Update(approval);
            await _context.SaveChangesAsync();
        }
    }
}
