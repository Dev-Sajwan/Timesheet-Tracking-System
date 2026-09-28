using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Timesheet
{
    public bool IsApproved;

    public int TimesheetId { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }

    // Existing daily entry fields
    public DateTime Date { get; set; }
    public int HoursWorked { get; set; }
    public string SubmissionType { get; set; } // Daily or Weekly
    public string ApprovalStatus { get; set; } // Pending, Approved, Rejected

    // New properties for weekly workflow
    public DateTime WeekStartDate { get; set; }
    public DateTime WeekEndDate { get; set; }

    // Navigation properties
    public Employee Employee { get; set; }
    public Project Project { get; set; }

    // Approvals you already had
    public ICollection<Approval> Approvals { get; set; }

    // NEW: Collection of entries for each day in the week
    public ICollection<TimesheetEntry> Entries { get; set; } = new List<TimesheetEntry>();
}

