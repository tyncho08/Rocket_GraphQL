using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;
using BCrypt.Net;

namespace MortgagePlatform.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new ArgumentException("Email already exists");
            }

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return GenerateJwtToken(user);
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await GetUserByEmailAsync(loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            return GenerateJwtToken(user);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}