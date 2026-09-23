using Domain.Entities;

namespace Application.Interfaces
{
    public interface IApprovalService
    {
        void Add(Approval approval);
        IEnumerable<Approval> GetAll();
        Approval? GetById(int id);
        void Delete(int id);
    }
}
