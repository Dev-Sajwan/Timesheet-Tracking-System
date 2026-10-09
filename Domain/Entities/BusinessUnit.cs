using System.Collections.Generic;

namespace Domain.Entities;

public class BusinessUnit
{
    public int BusinessUnitId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}