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
            CreateMap<Employee, EmployeeDto>()
                .ForMember(dest => dest.Roles, opt => opt.Ignore()); // Roles come from Identity
            CreateMap<EmployeeDto, Employee>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Don't overwrite ID
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Don't overwrite UserId
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Allocations, opt => opt.Ignore())
                .ForMember(dest => dest.Timesheets, opt => opt.Ignore())
                .ForMember(dest => dest.BenchHours, opt => opt.Ignore())
                .ForMember(dest => dest.LeaveRecords, opt => opt.Ignore());
            CreateMap<Project, ProjectDto>().ReverseMap();
            CreateMap<Client, ClientDto>().ReverseMap();
            CreateMap<Allocation, AllocationDto>().ReverseMap();
            CreateMap<BenchHour, BenchHourDto>().ReverseMap();
            CreateMap<Holiday, HolidayDto>().ReverseMap();
            CreateMap<LeaveRecord, LeaveRecordDto>().ReverseMap();
        }
    }
}
