namespace Domain.Entities
{
    public class Employee
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";

        // Link to Identity user
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }

        // Domain relationships
        public ICollection<Allocation> Allocations { get; set; } = new List<Allocation>();
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
        public ICollection<BenchHour> BenchHours { get; set; } = new List<BenchHour>();
        public ICollection<LeaveRecord> LeaveRecords { get; set; } = new List<LeaveRecord>();
    }
}
