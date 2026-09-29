using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class BenchHourRepository : IBenchHourRepository
    {
        private readonly TimesheetDbContext _context;

        public BenchHourRepository(TimesheetDbContext context) => _context = context;

        public async Task AddAsync(BenchHour benchHour)
        {
            await _context.BenchHours.AddAsync(benchHour);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<BenchHour>> GetAllAsync() => await _context.BenchHours.ToListAsync();
        public async Task<BenchHour?> GetByIdAsync(int id) => await _context.BenchHours.FindAsync(id);

        public async Task DeleteAsync(int id)
        {
            var emp = await _context.BenchHours.FindAsync(id);
            if (emp != null)
            {
                _context.BenchHours.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }
    }
}
