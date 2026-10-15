using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayService
    {
        Task AddAsync(Holiday holiday);
        Task<IEnumerable<Holiday>> GetAllAsync();
        Task<IEnumerable<Holiday>> GetAllAsync(string currentUserRole);
        Task<Holiday?> GetByIdAsync(int id);
        Task UpdateAsync(Holiday holiday);
        Task DeleteAsync(int id);
    }
}
