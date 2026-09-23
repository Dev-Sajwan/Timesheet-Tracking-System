using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _service;

        public ClientsController(IClientService service) => _service = service;

        [HttpPost]
        public IActionResult Add(ClientDto dto)
        {
            var client = new Client
            {
                ClientName = dto.ClientName,
                Description = dto.Description
            };
            _service.Add(client);
            return Ok("Client added successfully!");
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var client = _service.GetById(id);
            return client != null ? Ok(client) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Client deleted successfully!");
        }
    }
}