using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Allocation
{
    public int AllocationId { get; set; }
    public string? EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public int AllocationPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public Employee? Employee { get; set; }
    public Project Project { get; set; }
}
