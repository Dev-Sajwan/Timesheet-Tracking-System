using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayRepository
    {
        Task AddAsync(Holiday holiday);
        Task<IEnumerable<Holiday>> GetAllAsync();
        Task<Holiday?> GetByIdAsync(int id);
        Task UpdateAsync(Holiday holiday);
        Task DeleteAsync(int id);
    }
}
