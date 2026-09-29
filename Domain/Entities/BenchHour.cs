using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class BenchHour
{
    public int BenchHourId { get; set; }
    public string? EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public int Hours { get; set; }
    public string? Description { get; set; }

    public Employee? Employee { get; set; }
}
