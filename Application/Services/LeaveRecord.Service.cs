using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class LeaveRecordService : ILeaveRecordService
    {
        private readonly ILeaveRecordRepository _repository;

        public LeaveRecordService(ILeaveRecordRepository repository) => _repository = repository;

        public void Add(LeaveRecord leaveRecord) => _repository.Add(leaveRecord);
        public IEnumerable<LeaveRecord> GetAll() => _repository.GetAll();
        public LeaveRecord? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
