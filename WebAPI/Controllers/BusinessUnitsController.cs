using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessUnitsController : ControllerBase
    {
        private readonly ITimesheetDbContext _context;
        private readonly ILogger<BusinessUnitsController> _logger;

        public BusinessUnitsController(ITimesheetDbContext context, ILogger<BusinessUnitsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusinessUnit>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all business units");
                var units = await _context.BusinessUnits
                    .ToListAsync();
                return Ok(units);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all business units");
                return StatusCode(500, new { Message = "An error occurred while retrieving business units" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BusinessUnit>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting business unit by ID: {BusinessUnitId}", id);
                var unit = await _context.BusinessUnits
                    .FirstOrDefaultAsync(b => b.BusinessUnitId == id);

                if (unit == null) return NotFound(new { Message = "Business unit not found" });

                return Ok(unit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business unit by ID: {BusinessUnitId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the business unit" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<BusinessUnit>> Create(BusinessUnit businessUnit)
        {
            try
            {
                _logger.LogInformation("Creating new business unit: {BusinessUnitName}", businessUnit.Name);
                
                if (string.IsNullOrWhiteSpace(businessUnit.Name))
                {
                    return BadRequest(new { Message = "Business unit name is required" });
                }

                _context.BusinessUnits.Add(businessUnit);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Business unit created successfully: {BusinessUnitId}", businessUnit.BusinessUnitId);
                return CreatedAtAction(nameof(GetById), new { id = businessUnit.BusinessUnitId }, businessUnit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating business unit: {BusinessUnitName}", businessUnit.Name);
                return StatusCode(500, new { Message = "An error occurred while creating the business unit" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, BusinessUnit businessUnit)
        {
            try
            {
                _logger.LogInformation("Updating business unit: {BusinessUnitId}", id);
                
                if (id != businessUnit.BusinessUnitId) return BadRequest(new { Message = "ID mismatch" });

                var existing = await _context.BusinessUnits.FindAsync(id);
                if (existing == null) return NotFound(new { Message = "Business unit not found" });

                existing.Name = businessUnit.Name;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Business unit updated successfully: {BusinessUnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating business unit: {BusinessUnitId}", id);
                return StatusCode(500, new { Message = "An error occurred while updating the business unit" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting business unit: {BusinessUnitId}", id);
                var unit = await _context.BusinessUnits.FindAsync(id);
                if (unit == null) return NotFound(new { Message = "Business unit not found" });

                _context.BusinessUnits.Remove(unit);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Business unit deleted successfully: {BusinessUnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting business unit: {BusinessUnitId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the business unit" });
            }
        }
    }
}