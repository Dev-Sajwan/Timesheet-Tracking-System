using Domain.Entities;

namespace Application.Interfaces
{
    public interface IClientRepository
    {
        void Add(Client client);
        IEnumerable<Client> GetAll();
        Client? GetById(int id);
        void Delete(int id);
    }
}
