using Domain.Entities;

public class Timesheet
{
    public int TimesheetId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;// Updated to string
    public int ProjectId { get; set; }

    public DateTime Date { get; set; }
    public int HoursWorked { get; set; }
    public string SubmissionType { get; set; }
    public string ApprovalStatus { get; set; }

    public DateTime WeekStartDate { get; set; }
    public DateTime WeekEndDate { get; set; }

    public Employee Employee { get; set; }
    public Project Project { get; set; }

    public ICollection<Approval> Approvals { get; set; }
    public ICollection<TimesheetEntry> Entries { get; set; } = new List<TimesheetEntry>();

    public bool IsApproved { get; set; } // Add this property

}