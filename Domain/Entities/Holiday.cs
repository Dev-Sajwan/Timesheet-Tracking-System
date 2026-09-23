using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Holiday
{
    public int HolidayId { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; }
}
