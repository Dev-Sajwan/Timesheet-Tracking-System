using Domain.Entities;

namespace Application.Interfaces
{
    public interface ILeaveRecordRepository
    {
        Task AddAsync(LeaveRecord leaveRecord);
        Task<IEnumerable<LeaveRecord>> GetAllAsync();
        Task<LeaveRecord?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
