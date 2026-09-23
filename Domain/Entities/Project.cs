using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Project
{
    public int ProjectId { get; set; }
    public int ClientId { get; set; }
    public string ProjectName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public Client Client { get; set; }
    public ICollection<Allocation> Allocations { get; set; }
    public ICollection<Timesheet> Timesheets { get; set; }
}
