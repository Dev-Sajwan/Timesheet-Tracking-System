using Application.DTOs;
using Domain.Entities;
using AutoMapper;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Timesheet, TimesheetDto>().ReverseMap();
            CreateMap<TimesheetEntry, TimesheetEntryDto>().ReverseMap();
            CreateMap<Approval, ApprovalDto>().ReverseMap();
            CreateMap<Employee, EmployeeDto>().ReverseMap();
            CreateMap<Project, ProjectDto>().ReverseMap();
            CreateMap<Client, ClientDto>().ReverseMap();
            CreateMap<Allocation, AllocationDto>().ReverseMap();
            CreateMap<BenchHour, BenchHourDto>().ReverseMap();
            CreateMap<Holiday, HolidayDto>().ReverseMap();
            CreateMap<LeaveRecord, LeaveRecordDto>().ReverseMap();
        }
    }
}
