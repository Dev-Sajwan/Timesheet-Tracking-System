using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayService
    {
        Task AddAsync(Holiday holiday);
        Task<IEnumerable<Holiday>> GetAllAsync();
        Task<Holiday?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
