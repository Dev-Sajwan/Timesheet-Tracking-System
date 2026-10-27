using System;

namespace Domain.Entities;

public class LeaveBalance
{
    public int LeaveBalanceId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public int LeaveTypeId { get; set; }
    public int Year { get; set; } = DateTime.UtcNow.Year;
    public decimal OpeningBalance { get; set; }
    public decimal CreditedBalance { get; set; }
    public decimal LeavesTaken { get; set; }
    public decimal ClosingBalance => OpeningBalance + CreditedBalance - LeavesTaken;

    public Employee? Employee { get; set; }
    public LeaveType? LeaveType { get; set; }
}
