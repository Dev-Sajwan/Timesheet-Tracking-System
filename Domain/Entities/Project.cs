using System.Collections.Generic;

namespace Domain.Entities;

public class Project
{
    public int ProjectId { get; set; }
    public int ClientId { get; set; }
    public int? BusinessUnitId { get; set; }
    public string ProjectName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public Client Client { get; set; }
    public BusinessUnit BusinessUnit { get; set; }
    public ICollection<Allocation> Allocations { get; set; }
    public ICollection<Timesheet> Timesheets { get; set; }
}
