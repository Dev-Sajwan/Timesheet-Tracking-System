using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly IApprovalRepository _repository;

        public ApprovalService(IApprovalRepository repository) => _repository = repository;

        public void Add(Approval approval) => _repository.Add(approval);
        public IEnumerable<Approval> GetAll() => _repository.GetAll();
        public Approval? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
