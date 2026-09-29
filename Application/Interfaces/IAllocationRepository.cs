using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAllocationRepository
    {
        Task AddAsync(Allocation allocation);
        Task<IEnumerable<Allocation>> GetAllAsync();
        Task <Allocation?> GetByIdAsync(int id);
        Task<Allocation?> GetByEmployeeAndProjectAsync(string employeeId, int projectId);
        Task UpdateAsync(Allocation allocation);
        Task DeleteAsync(int id);
    }
}
