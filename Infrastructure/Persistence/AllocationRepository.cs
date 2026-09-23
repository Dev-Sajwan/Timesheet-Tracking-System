using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class AllocationRepository : IAllocationRepository
    {
        private readonly TimesheetDbContext _context;

        public AllocationRepository(TimesheetDbContext context) => _context = context;

        public void Add(Allocation allocation)
        {
            _context.Allocations.Add(allocation);
            _context.SaveChanges();
        }

        public IEnumerable<Allocation> GetAll() => _context.Allocations.ToList();
        public Allocation? GetById(int id) => _context.Allocations.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Allocations.Find(id);
            if (emp != null)
            {
                _context.Allocations.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
