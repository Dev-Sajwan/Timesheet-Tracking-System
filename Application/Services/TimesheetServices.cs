using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class TimesheetService : ITimesheetService
    {
        private readonly ITimesheetRepository _timesheetRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public TimesheetService(ITimesheetRepository timesheetRepository, UserManager<ApplicationUser> userManager)
        {
            _timesheetRepository = timesheetRepository;
            _userManager = userManager;
        }

        public async Task<IEnumerable<Timesheet>> GetAllAsync() =>
            await _timesheetRepository.GetAllAsync();

        public async Task<IEnumerable<Timesheet>> GetAllAsync(string currentUserRole)
        {
            // Admin bypass - if empty or null role, return all (admin case)
            if (string.IsNullOrEmpty(currentUserRole))
                return await _timesheetRepository.GetAllAsync();

            var allTimesheets = await _timesheetRepository.GetAllAsync();
            
            // Role hierarchy: L1 > L2 > L3 > L4
            var allowedRoles = GetAllowedRoles(currentUserRole);
            
            var filteredTimesheets = new List<Timesheet>();
            foreach (var ts in allTimesheets)
            {
                var user = await _userManager.FindByIdAsync(ts.Employee?.UserId ?? "");
                if (user != null)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var userRole = roles.FirstOrDefault(r => r.StartsWith("L"));
                    if (userRole != null && allowedRoles.Contains(userRole))
                    {
                        filteredTimesheets.Add(ts);
                    }
                }
                else if (string.IsNullOrEmpty(currentUserRole))
                {
                    filteredTimesheets.Add(ts);
                }
            }
            
            return filteredTimesheets;
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

        public async Task<Timesheet> GetByIdAsync(int id)
        {
            return await _timesheetRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Timesheet>> GetByEmployeeAndWeekAsync(string employeeId, DateTime weekStart)
        {
            return await _timesheetRepository.GetByEmployeeAndWeekAsync(employeeId, weekStart);
        }

        public async Task<IEnumerable<Timesheet>> GetByEmployeeAsync(string employeeId)
        {
            return await _timesheetRepository.GetByEmployeeAsync(employeeId);
        }

        public async Task AddAsync(Timesheet timesheet)
        {
            ValidateTimesheet(timesheet);
            await _timesheetRepository.AddAsync(timesheet);
        }

        public async Task UpdateAsync(Timesheet timesheet)
        {
            ValidateTimesheet(timesheet);
            await _timesheetRepository.UpdateAsync(timesheet);
        }

        public async Task DeleteAsync(int id)
        {
            await _timesheetRepository.DeleteAsync(id);
        }

        public async Task SubmitAsync(int id)
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(id);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Submitted";
            await _timesheetRepository.UpdateAsync(timesheet);
        }

        public async Task ApproveAsync(int id)
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(id);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Approved";
            timesheet.IsApproved = true;
            await _timesheetRepository.UpdateAsync(timesheet);
        }

        public async Task RejectAsync(int id)
        {
            var timesheet = await _timesheetRepository.GetByIdAsync(id);
            if (timesheet == null) throw new Exception("Timesheet not found");

            timesheet.ApprovalStatus = "Rejected";
            await _timesheetRepository.UpdateAsync(timesheet);
        }

        private void ValidateTimesheet(Timesheet timesheet)
        {
            if (timesheet.Entries != null)
            {
                var totalHours = timesheet.Entries.Sum(e => e.Hours);
                if (totalHours > 40)
                    throw new Exception("Weekly hours cannot exceed 40");

                foreach (var entry in timesheet.Entries)
                {
                    if (entry.Description?.ToLower().Contains("leave") == true && entry.Hours != 8)
                        throw new Exception("Leave must be exactly 8 hours per day");

                    if (entry.Description?.ToLower().Contains("bench") == true && string.IsNullOrWhiteSpace(entry.Description))
                        throw new Exception("Bench hours must include a description");
                }
            }
        }
    }
}
