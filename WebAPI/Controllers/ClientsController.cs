using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly IMapper _mapper;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(IClientService clientService, IMapper mapper, ILogger<ClientsController> logger)
        {
            _clientService = clientService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/clients/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting client by ID: {ClientId}", id);
                var client = await _clientService.GetByIdAsync(id);

                if (client == null)
                {
                    _logger.LogWarning("Client not found: {ClientId}", id);
                    return NotFound(new { Message = "Client not found" });
                }

                return Ok(_mapper.Map<ClientDto>(client));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client by ID: {ClientId}", id);
                return StatusCode(500, new { Message = "An error occurred while retrieving the client" });
            }
        }

        // GET: api/clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Getting all clients");
                var clients = await _clientService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<ClientDto>>(clients));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all clients");
                return StatusCode(500, new { Message = "An error occurred while retrieving clients" });
            }
        }

        // POST: api/clients
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] ClientDto dto)
        {
            try
            {
                _logger.LogInformation("Adding new client: {ClientName}", dto.ClientName);
                if (string.IsNullOrWhiteSpace(dto.ClientName))
                    return BadRequest(new { Message = "Client name is required." });

                var client = _mapper.Map<Client>(dto);
                await _clientService.AddAsync(client);
                _logger.LogInformation("Client added successfully: {ClientId}", client.ClientId);
                return Ok(new { Message = "Client added successfully!", ClientId = client.ClientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding client: {ClientName}", dto.ClientName);
                return StatusCode(500, new { Message = "An error occurred while adding the client" });
            }
        }

        // DELETE: api/clients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting client: {ClientId}", id);
                await _clientService.DeleteAsync(id);
                _logger.LogInformation("Client deleted successfully: {ClientId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client: {ClientId}", id);
                return StatusCode(500, new { Message = "An error occurred while deleting the client" });
            }
        }
    }
}