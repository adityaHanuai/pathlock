using Microsoft.AspNetCore.Mvc;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;
using ProjectManager.Services;
using System.Linq;

namespace ProjectManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    //
    public class AuthController : ControllerBase
    {
        // Dependencies
        private readonly ApplicationDbContext _context;
        private readonly AuthService _authService;

        public AuthController(ApplicationDbContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        // Registration endpoint
        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Username == dto.Username))
                return BadRequest("Username already exists.");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = _authService.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("User registered successfully!");
        }

        // Login endpoint
        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);
            if (user == null) return Unauthorized("Invalid credentials.");

            var hashed = _authService.HashPassword(dto.Password);
            if (user.PasswordHash != hashed) return Unauthorized("Invalid credentials.");

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { Token = token });
        }
    }
}
