using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayRepository
    {
        Task AddAsync(Holiday holiday);
        Task<IEnumerable<Holiday>> GetAllAsync();
        Task<Holiday?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
