using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class BenchHourService : IBenchHourService
    {
        private readonly IBenchHourRepository _repository;

        public BenchHourService(IBenchHourRepository repository) => _repository = repository;

        public void Add(BenchHour benchHour) => _repository.Add(benchHour);
        public IEnumerable<BenchHour> GetAll() => _repository.GetAll();
        public BenchHour? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
