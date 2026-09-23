using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayRepository
    {
        void Add(Holiday holiday);
        IEnumerable<Holiday> GetAll();
        Holiday? GetById(int id);
        void Delete(int id);
    }
}
