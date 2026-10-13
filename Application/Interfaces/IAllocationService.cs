using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAllocationService
    {
        Task AddAsync(Allocation allocation);
        Task<IEnumerable<Allocation>> GetAllAsync();
        Task<IEnumerable<Allocation>> GetAllAsync(string currentUserRole);
        Task <Allocation?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
        Task<List<Allocation>> GetByEmployeeAndProjectAsync(string employeeId);
        Task UpdateAsync(Allocation allocation);
    }
}
