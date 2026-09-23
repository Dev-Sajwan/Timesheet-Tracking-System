using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class ClientRepository : IClientRepository
    {
        private readonly TimesheetDbContext _context;

        public ClientRepository(TimesheetDbContext context) => _context = context;

        public void Add(Client client)
        {
            _context.Clients.Add(client);
            _context.SaveChanges();
        }

        public IEnumerable<Client> GetAll() => _context.Clients.ToList();
        public Client? GetById(int id) => _context.Clients.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Clients.Find(id);
            if (emp != null)
            {
                _context.Clients.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
