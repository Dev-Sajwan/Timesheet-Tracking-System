using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class HolidayService : IHolidayService
    {
        private readonly IHolidayRepository _repository;

        public HolidayService(IHolidayRepository repository) => _repository = repository;

        public void Add(Holiday holiday) => _repository.Add(holiday);
        public IEnumerable<Holiday> GetAll() => _repository.GetAll();
        public Holiday? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
