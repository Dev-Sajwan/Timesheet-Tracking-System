using Domain.Entities;

namespace Application.DTOs
{
    public class LeaveRecordDto
    {
        public int LeaveRecordId { get; set; }
        public string? EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string HalfDayType { get; set; } = "None";
        public string Reason { get; set; } = string.Empty;
        public string? AttachmentPath { get; set; }
        public string Status { get; set; } = "Pending";
        public string ApprovalStage { get; set; } = "Manager";
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? EmployeeName { get; set; }
    }

    public class LeaveBalanceDto
    {
        public int LeaveBalanceId { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public int LeaveTypeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public int Year { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal CreditedBalance { get; set; }
        public decimal LeavesTaken { get; set; }
        public decimal ClosingBalance { get; set; }
    }

    public class LeaveAdjustmentDto
    {
        public string EmployeeId { get; set; } = string.Empty;
        public int LeaveTypeId { get; set; }
        public int Year { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public string AdjustmentType { get; set; } = "Correction";
    }

    public class LeaveApprovalDto
    {
        public int LeaveRecordId { get; set; }
        public string Action { get; set; } = "Approve";
        public string? RejectionReason { get; set; }
    }
}
