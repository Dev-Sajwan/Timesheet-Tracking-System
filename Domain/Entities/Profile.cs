using System.Collections.Generic;

namespace Domain.Entities;

public class Profile
{
    public int ProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemAdmin { get; set; } = false;

    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}