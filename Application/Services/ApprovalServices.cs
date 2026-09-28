using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly IApprovalRepository _approvalRepository;
        private readonly ITimesheetRepository _timesheetRepository;

        public ApprovalService(IApprovalRepository approvalRepository, ITimesheetRepository timesheetRepository)
        {
            _approvalRepository = approvalRepository;
            _timesheetRepository = timesheetRepository;
        }

        // ✅ Get approval record by timesheet
        public async Task<Approval> GetByTimesheetIdAsync(int timesheetId)
        {
            return await _approvalRepository.GetByTimesheetIdAsync(timesheetId);
        }

        // ✅ Submit timesheet for approval
        public async Task SubmitAsync(int timesheetId, string approvalType = "Manual")
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(timesheetId);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Submitted";
            await _timesheetRepository.UpdateAsync(timesheet);

            var approval = new Approval
            {
                TimesheetId = timesheetId,
                ApprovedBy = null, // not yet approved
                ApprovalDate = DateTime.UtcNow,
                ApprovalType = approvalType
            };

            await _approvalRepository.AddAsync(approval);
        }

        // ✅ Approve timesheet
        public async Task ApproveAsync(int timesheetId, string approverName, string approvalType = "Manual")
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(timesheetId);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Approved";
            timesheet.IsApproved = true;
            await _timesheetRepository.UpdateAsync(timesheet);

            var approval = await _approvalRepository.GetByTimesheetIdAsync(timesheetId);
            if (approval != null)
            {
                approval.ApprovedBy = approverName;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.ApprovalType = approvalType;
                await _approvalRepository.UpdateAsync(approval);
            }
        }

        // ✅ Reject timesheet
        public async Task RejectAsync(int timesheetId, string approverName, string approvalType = "Manual")
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(timesheetId);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Rejected";
            await _timesheetRepository.UpdateAsync(timesheet);

            var approval = await _approvalRepository.GetByTimesheetIdAsync(timesheetId);
            if (approval != null)
            {
                approval.ApprovedBy = approverName;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.ApprovalType = approvalType;
                await _approvalRepository.UpdateAsync(approval);
            }
        }
    }
}
