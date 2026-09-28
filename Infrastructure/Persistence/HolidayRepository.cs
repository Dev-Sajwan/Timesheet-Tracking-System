using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class HolidayRepository : IHolidayRepository
    {
        private readonly TimesheetDbContext _context;

        public HolidayRepository(TimesheetDbContext context) => _context = context;

        public async Task AddAsync(Holiday holiday)
        {
            await _context.Holidays.AddAsync(holiday);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Holiday>> GetAllAsync() => await _context.Holidays.ToListAsync();
        public async Task<Holiday?> GetByIdAsync(int id) => await _context.Holidays.FindAsync(id);

        public async Task DeleteAsync(int id)
        {
            var emp = await _context.Holidays.FindAsync(id);
            if (emp != null)
            {
                _context.Holidays.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }
    }
}
