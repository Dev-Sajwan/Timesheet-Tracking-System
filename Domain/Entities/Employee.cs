using Microsoft.AspNetCore.Identity;

namespace Domain.Entities
{
    public class Employee : IdentityUser
    {
        public string? Name { get; set; }

        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public bool IsActiveUser { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public ICollection<Allocation> Allocations { get; set; }
            = new List<Allocation>();

        public ICollection<Timesheet> Timesheets { get; set; }
            = new List<Timesheet>();

        public ICollection<BenchHour> BenchHours { get; set; }
            = new List<BenchHour>();

        public ICollection<LeaveRecord> LeaveRecords { get; set; }
            = new List<LeaveRecord>();
    }
}