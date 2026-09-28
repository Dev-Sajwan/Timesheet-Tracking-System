using Domain.Entities;

namespace Application.Interfaces
{
    public interface IApprovalRepository
    {
        // Existing methods
        Task AddAsync(Approval approval);
        Task<IEnumerable<Approval>> GetAllAsync();
        Task<Approval?> GetByIdAsync(int id);
        Task DeleteAsync(int id);

        // New methods for workflow
        Task<Approval> GetByTimesheetIdAsync(int timesheetId);
        Task UpdateAsync(Approval approval);
    }
}
