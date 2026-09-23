using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Client
{
    public int ClientId { get; set; }
    public string ClientName { get; set; }
    public string Description { get; set; }

    public ICollection<Project> Projects { get; set; }
}
