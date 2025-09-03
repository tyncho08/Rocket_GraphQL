using System.Threading.Tasks;
using MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.Services
{
    public interface ILoanService
    {
        Task<LoanApplicationDto> CreateLoanApplicationAsync(CreateLoanApplicationDto dto, int userId);
        Task<LoanApplicationDto> GetLoanApplicationByIdAsync(int id);
        Task<LoanApplicationDto[]> GetLoanApplicationsByUserIdAsync(int userId);
        Task<LoanApplicationDto[]> GetAllLoanApplicationsAsync();
        Task<object> GetAllLoanApplicationsWithPaginationAsync(int page, int limit, string status, string search);
        Task<LoanApplicationDto> UpdateLoanApplicationStatusAsync(int id, UpdateLoanApplicationStatusDto dto);
    }
}