using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _repository;

        public ClientService(IClientRepository repository) => _repository = repository;

        public void Add(Client client) => _repository.Add(client);
        public IEnumerable<Client> GetAll() => _repository.GetAll();
        public Client? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
