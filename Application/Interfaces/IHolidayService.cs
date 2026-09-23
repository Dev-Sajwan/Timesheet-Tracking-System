using Domain.Entities;

namespace Application.Interfaces
{
    public interface IHolidayService
    {
        void Add(Holiday holiday);
        IEnumerable<Holiday> GetAll();
        Holiday? GetById(int id);
        void Delete(int id);
    }
}
