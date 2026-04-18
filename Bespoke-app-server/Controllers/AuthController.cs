using System.Security.Claims;
using BespokeDuaApi.Data;
using BespokeDuaApi.DTO;
using BespokeDuaApi.Models;
using BespokeDuaApi.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BespokeDuaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BespokeDuaDbContext _context;

        public AuthController(BespokeDuaDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<GetUserDto>> Register(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Username, Email, and Password are required." });
            }

            var usernameExists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (usernameExists)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                HashedPassword = PasswordHasher.HashPassword(dto.Password),
                Plan = PlanType.Free,
                CreatedAt = DateTime.UtcNow,
                LastRequestDate = null
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var result = new GetUserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Plan = user.Plan.ToString(),
                LastRequestDate = user.LastRequestDate
            };

            return CreatedAtAction(nameof(GetCurrentUser), result);
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.HashedPassword))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var response = new LoginResponseDto
            {
                Message = "Login successful.",
                User = new GetUserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Plan = user.Plan.ToString(),
                    LastRequestDate = user.LastRequestDate
                }
            };

            return Ok(response);
        }

        // GET: api/Auth/me
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<GetUserDto>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound();
            }

            var dto = new GetUserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Plan = user.Plan.ToString(),
                LastRequestDate = user.LastRequestDate
            };

            return Ok(dto);
        }

        // DELETE: api/Auth/account
        [Authorize]
        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}