using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class AllocationService : IAllocationService
    {
        private readonly IAllocationRepository _repository;

        public AllocationService(IAllocationRepository repository) => _repository = repository;

        public void Add(Allocation allocation) => _repository.Add(allocation);
        public IEnumerable<Allocation> GetAll() => _repository.GetAll();
        public Allocation? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
