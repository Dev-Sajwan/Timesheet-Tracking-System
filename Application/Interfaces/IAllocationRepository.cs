using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAllocationRepository
    {
        void Add(Allocation allocation);
        IEnumerable<Allocation> GetAll();
        Allocation? GetById(int id);
        void Delete(int id);
    }
}
