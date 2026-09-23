using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class LeaveRecord
{
    public int LeaveId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public string LeaveType { get; set; } // Sick, Casual, Holiday
    public int Hours { get; set; } = 8; // Default 8 hrs/day

    public Employee Employee { get; set; }
}

