using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAllocationService
    {
        Task AddAsync(Allocation allocation);
        Task<IEnumerable<Allocation>> GetAllAsync();
        Task <Allocation?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
        Task<Allocation?> GetByEmployeeAndProjectAsync(int employeeId, int projectId);

        Task UpdateAsync(Allocation allocation);
    }
}
