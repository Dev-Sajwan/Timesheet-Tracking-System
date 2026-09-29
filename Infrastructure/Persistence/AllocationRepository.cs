using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class AllocationRepository : IAllocationRepository
    {
        private readonly TimesheetDbContext _context;

        public AllocationRepository(TimesheetDbContext context) => _context = context;

        public async Task AddAsync(Allocation allocation)
        {
            await _context.Allocations.AddAsync(allocation);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Allocation>> GetAllAsync() => await _context.Allocations.ToListAsync();
        public async Task<Allocation?> GetByIdAsync(int id) => await _context.Allocations.FindAsync(id);

        public async Task<Allocation?> GetByEmployeeAndProjectAsync(string employeeId, int projectId)
        {
            return await _context.Allocations
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.ProjectId == projectId);
        }


        public async Task DeleteAsync(int id)
        {
            var emp = await _context.Allocations.FindAsync(id);
            if (emp != null)
            {
                _context.Allocations.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateAsync(Allocation allocation)   // <-- implement update
        {
            _context.Allocations.Update(allocation);
            await _context.SaveChangesAsync();
        }
    }
}
