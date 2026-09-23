using Domain.Entities;

namespace Application.Interfaces
{
    public interface IBenchHourRepository
    {
        void Add(BenchHour benchHour);
        IEnumerable<BenchHour> GetAll();
        BenchHour? GetById(int id);
        void Delete(int id);
    }
}
