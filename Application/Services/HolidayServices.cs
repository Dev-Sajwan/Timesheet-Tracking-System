using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class HolidayService : IHolidayService
    {
        private readonly IHolidayRepository _repository;

        public HolidayService(IHolidayRepository repository) => _repository = repository;

        public async Task AddAsync(Holiday holiday) => await _repository.AddAsync(holiday);
        public async Task<IEnumerable<Holiday>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<Holiday?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
    }
}
