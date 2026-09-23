using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class HolidayRepository : IHolidayRepository
    {
        private readonly TimesheetDbContext _context;

        public HolidayRepository(TimesheetDbContext context) => _context = context;

        public void Add(Holiday holiday)
        {
            _context.Holidays.Add(holiday);
            _context.SaveChanges();
        }

        public IEnumerable<Holiday> GetAll() => _context.Holidays.ToList();
        public Holiday? GetById(int id) => _context.Holidays.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Holidays.Find(id);
            if (emp != null)
            {
                _context.Holidays.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
