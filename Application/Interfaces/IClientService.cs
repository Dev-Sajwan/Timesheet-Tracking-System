using Domain.Entities;

namespace Application.Interfaces
{
    public interface IClientService
    {
        Task AddAsync(Client client);
        Task<IEnumerable<Client>> GetAllAsync();
        Task<Client?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
