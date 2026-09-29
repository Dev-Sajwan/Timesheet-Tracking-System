namespace Application.DTOs
{
    public class TimesheetDto
    {
        public int TimesheetId { get; set; }
        public string? EmployeeId { get; set; }
        public int ProjectId { get; set; }
        public DateTime Date { get; set; }
        public int HoursWorked { get; set; }
        public string SubmissionType { get; set; } // Daily or Weekly
        public string ApprovalStatus { get; set; } // Pending, Approved, Rejected
        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }

        // Flattened collections
        public List<TimesheetEntryDto> Entries { get; set; } = new();
        public List<ApprovalDto> Approvals { get; set; } = new();
    }

    public class TimesheetEntryDto
    {
        public int Id { get; set; }
        public int TimesheetId { get; set; }
        public DateTime Date { get; set; }
        public int Hours { get; set; }
        public string Description { get; set; }
    }


}
