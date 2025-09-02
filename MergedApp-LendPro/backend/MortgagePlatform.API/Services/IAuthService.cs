using System.Threading.Tasks;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto registerDto);
        Task<string> LoginAsync(LoginDto loginDto);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByIdAsync(int id);
        string GenerateJwtToken(User user);
    }
}