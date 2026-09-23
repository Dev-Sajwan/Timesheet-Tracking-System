using Domain.Entities;

namespace Application.Interfaces
{
    public interface ILeaveRecordRepository
    {
        void Add(LeaveRecord leaveRecord);
        IEnumerable<LeaveRecord> GetAll();
        LeaveRecord? GetById(int id);
        void Delete(int id);
    }
}
