
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRecordsController : ControllerBase
    {
        private readonly ILeaveRecordService _leaveRecordService;
        private readonly IMapper _mapper;

        public LeaveRecordsController(
            ILeaveRecordService leaveRecordService,
            IMapper mapper)
        {
            _leaveRecordService = leaveRecordService;
            _mapper = mapper;
        }

        // GET: api/leaverecords/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveRecordDto>> GetById(int id)
        {
            var leaveRecord = await _leaveRecordService.GetByIdAsync(id);

            if (leaveRecord == null)
                return NotFound();

            return Ok(_mapper.Map<LeaveRecordDto>(leaveRecord));
        }

        // GET: api/leaverecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveRecordDto>>> GetAll()
        {
            var leaveRecords = await _leaveRecordService.GetAllAsync();

            return Ok(_mapper.Map<IEnumerable<LeaveRecordDto>>(leaveRecords));
        }

        // POST: api/leaverecords
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] LeaveRecordDto dto)
        {
            var leaveRecord = _mapper.Map<LeaveRecord>(dto);

            await _leaveRecordService.AddAsync(leaveRecord);

            return Ok("Leave record added successfully!");
        }

        // DELETE: api/leaverecords/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _leaveRecordService.DeleteAsync(id);

            return NoContent();
        }
    }
}
