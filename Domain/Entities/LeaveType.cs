using System;

namespace Domain.Entities;

public class LeaveType
{
    public int LeaveTypeId { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. Earned Leave, Sick Leave, Paternity
    public string? Description { get; set; }
    public decimal DefaultQuota { get; set; } = 12;
    public bool IsActive { get; set; } = true;
}
