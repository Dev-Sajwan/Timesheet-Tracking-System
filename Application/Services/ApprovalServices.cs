using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel;

namespace Application.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly IApprovalRepository _approvalRepository;
        private readonly ITimesheetRepository _timesheetRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public ApprovalService(IApprovalRepository approvalRepository, ITimesheetRepository timesheetRepository, UserManager<ApplicationUser> userManager)
        {
            _approvalRepository = approvalRepository;
            _timesheetRepository = timesheetRepository;
            _userManager = userManager;
        }

        // ✅ Get approval record by timesheet
        public async Task<Approval> GetByTimesheetIdAsync(int timesheetId)
        {
            return await _approvalRepository.GetByTimesheetIdAsync(timesheetId);
        }

        public async Task<IEnumerable<Approval>> GetAllAsync() => await _approvalRepository.GetAllAsync();

        public async Task<IEnumerable<Approval>> GetAllAsync(string currentUserRole)
        {
            // Admin bypass - if empty or null role, return all (admin case)
            if (string.IsNullOrEmpty(currentUserRole))
                return await _approvalRepository.GetAllAsync();

            var allApprovals = await _approvalRepository.GetAllAsync();
            
            // Role hierarchy: L1 > L2 > L3 > L4
            var allowedRoles = GetAllowedRoles(currentUserRole);
            
            var filteredApprovals = new List<Approval>();
            foreach (var approval in allApprovals)
            {
                var timesheet = await _timesheetRepository.GetByIdAsync(approval.TimesheetId);
                if (timesheet != null)
                {
                    var user = await _userManager.FindByIdAsync(timesheet.Employee?.UserId ?? "");
                    if (user != null)
                    {
                        var roles = await _userManager.GetRolesAsync(user);
                        var userRole = roles.FirstOrDefault(r => r.StartsWith("L"));
                        if (userRole != null && allowedRoles.Contains(userRole))
                        {
                            filteredApprovals.Add(approval);
                        }
                    }
                    else if (string.IsNullOrEmpty(currentUserRole))
                    {
                        filteredApprovals.Add(approval);
                    }
                }
            }
            
            return filteredApprovals;
        }

        private List<string> GetAllowedRoles(string currentUserRole)
        {
            var roleHierarchy = new Dictionary<string, List<string>>
            {
                { "L1", new List<string> { "L1", "L2", "L3", "L4" } },
                { "L2", new List<string> { "L2", "L3", "L4" } },
                { "L3", new List<string> { "L3", "L4" } },
                { "L4", new List<string> { "L4" } }
            };

            return roleHierarchy.TryGetValue(currentUserRole, out var roles) ? roles : new List<string>();
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
        public async Task ApproveAsync(int timesheetId, string approverName, string approvedDescription, string approvalType = "Manual")
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
                approval.Description = approvedDescription;
                await _approvalRepository.UpdateAsync(approval);
            }
            else
            {
                var newApproval = new Approval
                {
                    TimesheetId = timesheetId,
                    ApprovedBy = approverName,
                    ApprovalDate = DateTime.UtcNow,
                    ApprovalType = approvalType,
                    Description = approvedDescription
                };
                await _approvalRepository.AddAsync(newApproval);
            }
        }

        // ✅ Reject timesheet
        public async Task RejectAsync(int timesheetId, string approverName, string approvedDescription, string approvalType = "Manual")
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
                approval.Description = approvedDescription;
                await _approvalRepository.UpdateAsync(approval);
            }
            else
            {
                var newApproval = new Approval
                {
                    TimesheetId = timesheetId,
                    ApprovedBy = approverName,
                    ApprovalDate = DateTime.UtcNow,
                    ApprovalType = approvalType,
                    Description = approvedDescription
                };
                await _approvalRepository.AddAsync(newApproval);
            }
        }
    }
}
