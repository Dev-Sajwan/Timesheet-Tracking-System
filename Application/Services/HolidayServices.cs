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
        
        public async Task<IEnumerable<Holiday>> GetAllAsync(string currentUserRole)
        {
            // Admin bypass - if empty or null role, return all (admin case)
            if (string.IsNullOrEmpty(currentUserRole))
                return await _repository.GetAllAsync();

            // For holidays, we typically don't filter by role as they are global
            // But we keep the signature for consistency
            return await _repository.GetAllAsync();
        }

        public async Task<Holiday?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task UpdateAsync(Holiday holiday) => await _repository.UpdateAsync(holiday);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
    }
}
