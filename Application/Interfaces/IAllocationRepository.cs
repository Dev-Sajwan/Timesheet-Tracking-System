using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAllocationRepository
    {
        Task AddAsync(Allocation allocation);
        Task<IEnumerable<Allocation>> GetAllAsync();
        Task <Allocation?> GetByIdAsync(int id);
        Task<List<Allocation>> GetByEmployeeAndProjectAsync(string employeeId);
        Task UpdateAsync(Allocation allocation);
        Task DeleteAsync(int id);
    }
}
