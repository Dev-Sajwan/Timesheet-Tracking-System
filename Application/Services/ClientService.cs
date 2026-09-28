using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _repository;

        public ClientService(IClientRepository repository) => _repository = repository;

        public async Task AddAsync(Client client) => await _repository.AddAsync(client);
        public async Task<IEnumerable<Client>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<Client?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
    }
}
