using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class BenchHourRepository : IBenchHourRepository
    {
        private readonly TimesheetDbContext _context;

        public BenchHourRepository(TimesheetDbContext context) => _context = context;

        public void Add(BenchHour benchHour)
        {
            _context.BenchHours.Add(benchHour);
            _context.SaveChanges();
        }

        public IEnumerable<BenchHour> GetAll() => _context.BenchHours.ToList();
        public BenchHour? GetById(int id) => _context.BenchHours.Find(id);

        public void Delete(int id)
        {
            var emp = _context.BenchHours.Find(id);
            if (emp != null)
            {
                _context.BenchHours.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
