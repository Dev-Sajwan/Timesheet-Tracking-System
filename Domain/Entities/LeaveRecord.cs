using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class LeaveRecord
{
    public int LeaveRecordId { get; set; }
    public string? EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalDays { get; set; }
    public string HalfDayType { get; set; } = "None"; // None, FirstHalf, SecondHalf, FullDay
    public string Reason { get; set; } = string.Empty;
    public string? AttachmentPath { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, ManagerApproved, HRApproved, Approved, Rejected, Cancelled
    public string ApprovalStage { get; set; } = "Manager"; // Manager, HR, Completed
    public string? RejectionReason { get; set; }
    public int Hours { get; set; } = 8;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Employee? Employee { get; set; }
    public LeaveType? LeaveType { get; set; }
}
