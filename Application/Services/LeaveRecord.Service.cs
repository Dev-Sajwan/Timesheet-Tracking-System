using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class LeaveRecordService : ILeaveRecordService
    {
        private readonly ILeaveRecordRepository _repository;

        public LeaveRecordService(ILeaveRecordRepository repository) => _repository = repository;

        public async Task AddAsync(LeaveRecord leaveRecord) => await _repository.AddAsync(leaveRecord);
        public async Task<IEnumerable<LeaveRecord>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<LeaveRecord?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
    }
}
