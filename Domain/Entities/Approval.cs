using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;


    public class Approval
    {
        public int ApprovalId { get; set; }
        public int TimesheetId { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime ApprovalDate { get; set; }
        public string ApprovalType { get; set; } // Auto or Manual

        public Timesheet Timesheet { get; set; }
    }


