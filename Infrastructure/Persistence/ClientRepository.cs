using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class ClientRepository : IClientRepository
    {
        private readonly TimesheetDbContext _context;

        public ClientRepository(TimesheetDbContext context) => _context = context;

        public async Task AddAsync(Client client)
        {
            _context.Clients.AddAsync(client);
            _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Client>> GetAllAsync() => await _context.Clients.ToListAsync();
        public async Task<Client?> GetByIdAsync(int id) => await _context.Clients.FindAsync(id);

        public async Task DeleteAsync(int id)
        {
            var emp = await _context.Clients.FindAsync(id);
            if (emp != null)
            {
                _context.Clients.Remove(emp);
                await _context.SaveChangesAsync();
            }
        }
    }
}
