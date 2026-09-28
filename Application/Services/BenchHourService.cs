using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class BenchHourService : IBenchHourService
    {
        private readonly IBenchHourRepository _repository;

        public BenchHourService(IBenchHourRepository repository) => _repository = repository;

        public async Task AddAsync(BenchHour benchHour) => await _repository.AddAsync(benchHour);
        public async Task<IEnumerable<BenchHour>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<BenchHour?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
    }
}
