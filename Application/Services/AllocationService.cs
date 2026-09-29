using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class AllocationService : IAllocationService
    {
        private readonly IAllocationRepository _repository;

        public AllocationService(IAllocationRepository repository) => _repository = repository;

        public async Task AddAsync(Allocation allocation) => await _repository.AddAsync(allocation);
        public async Task<IEnumerable<Allocation>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<Allocation?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task<Allocation?> GetByEmployeeAndProjectAsync(string? employeeId, int projectId) =>
            await _repository.GetByEmployeeAndProjectAsync(employeeId, projectId);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
        public async Task UpdateAsync(Allocation allocation) =>   // <-- implement update
        await _repository.UpdateAsync(allocation);
    }
}
