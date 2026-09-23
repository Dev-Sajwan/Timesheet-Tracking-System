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
    public DateTime Date { get; set; }
    public int HoursWorked { get; set; }
    public string SubmissionType { get; set; } // Daily or Weekly
    public string ApprovalStatus { get; set; } // Pending, Approved, Rejected

    public Employee Employee { get; set; }
    public Project Project { get; set; }
    public ICollection<Approval> Approvals { get; set; }
}
