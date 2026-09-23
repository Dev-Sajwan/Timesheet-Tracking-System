using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class ApprovalRepository : IApprovalRepository
    {
        private readonly TimesheetDbContext _context;

        public ApprovalRepository(TimesheetDbContext context) => _context = context;

        public void Add(Approval approval)
        {
            _context.Approvals.Add(approval);
            _context.SaveChanges();
        }

        public IEnumerable<Approval> GetAll() => _context.Approvals.ToList();
        public Approval? GetById(int id) => _context.Approvals.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Approvals.Find(id);
            if (emp != null)
            {
                _context.Approvals.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
