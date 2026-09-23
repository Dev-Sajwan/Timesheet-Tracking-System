using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRecordsController : ControllerBase
    {
        private readonly ILeaveRecordService _service;

        public LeaveRecordsController(ILeaveRecordService service) => _service = service;

        [HttpPost]
        public IActionResult Add(LeaveRecordDto dto)
        {
            var leaveRecord = new LeaveRecord
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                LeaveType = dto.LeaveType,
                Hours = dto.Hours
            };
            _service.Add(leaveRecord);
            return Ok("Leave record added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var leaveRecord = _service.GetById(id);
            return leaveRecord != null ? Ok(leaveRecord) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Leave record deleted successfully!");
        }
    }
}