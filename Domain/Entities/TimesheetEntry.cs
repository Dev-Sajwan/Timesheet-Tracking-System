using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class TimesheetEntry
{
    public int Id { get; set; }
    public int TimesheetId { get; set; }
    public DateTime Date { get; set; }
    public int Hours { get; set; }
    //public TaskType TaskType { get; set; } // Project, Bench, Leave, Holiday
    public string? Description { get; set; }

    public Timesheet Timesheet { get; set; }
}


