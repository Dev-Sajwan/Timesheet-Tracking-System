using Domain.Entities;

namespace Application.Interfaces
{
    public interface IApprovalService
    {
        Task<Approval> GetByTimesheetIdAsync(int timesheetId);

        Task SubmitAsync(int timesheetId, string approvalType = "Manual");

        Task ApproveAsync(int timesheetId, string approverName, string approvalType = "Manual");

        Task RejectAsync(int timesheetId, string approverName, string approvalType = "Manual");
    }
}
