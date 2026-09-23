using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalsController : ControllerBase
    {
        private readonly IApprovalService _service;

        public ApprovalsController(IApprovalService service) => _service = service;

        [HttpPost]
        public IActionResult Add(ApprovalDto dto)
        {
            var approval = new Approval
            {
                TimesheetId = dto.TimesheetId,
                ApprovalDate = dto.ApprovalDate,
                ApprovedBy = dto.ApprovedBy,
                ApprovalType = dto.ApprovalType
            };
            _service.Add(approval);
            return Ok("Approval added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var approval = _service.GetById(id);
            return approval != null ? Ok(approval) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Approval deleted successfully!");
        }
    }
}