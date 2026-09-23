using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Status { get; set; } // Active, Inactive

        public ICollection<Allocation> Allocations { get; set; }
        public ICollection<Timesheet> Timesheets { get; set; }
        public ICollection<BenchHour> BenchHours { get; set; }
        public ICollection<LeaveRecord> LeaveRecords { get; set; }
    }
}
