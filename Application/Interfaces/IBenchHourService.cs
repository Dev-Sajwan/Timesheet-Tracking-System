using Domain.Entities;

namespace Application.Interfaces
{
    public interface IBenchHourService
    {
        Task AddAsync(BenchHour benchHour);
        Task<IEnumerable<BenchHour>> GetAllAsync();
        Task<BenchHour?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
