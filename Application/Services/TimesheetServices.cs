using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class TimesheetService : ITimesheetService
    {
        private readonly ITimesheetRepository _timesheetRepository;

        public TimesheetService(ITimesheetRepository timesheetRepository)
        {
            _timesheetRepository = timesheetRepository;
        }

        public async Task<IEnumerable<Timesheet>> GetAllAsync() =>
            await _timesheetRepository.GetAllAsync();

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
