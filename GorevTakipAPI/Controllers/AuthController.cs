using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using System.Text.RegularExpressions;
using GorevTakipAPI.DTOs;

namespace GorevTakipAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto registerDto)
    {
        if (registerDto == null)
            return BadRequest(new { message = "Geçersiz istek: boş veri gönderildi." });

        if (string.IsNullOrWhiteSpace(registerDto.Email) ||
            string.IsNullOrWhiteSpace(registerDto.Password) ||
            string.IsNullOrWhiteSpace(registerDto.FullName))
            return BadRequest(new { message = "Tüm alanlar doldurulmalıdır." });


        var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        if (!emailRegex.IsMatch(registerDto.Email))
            return BadRequest(new { message = "Geçerli bir email adresi giriniz. Örnek: kullanici@domain.com" });

        if (_context.Users.Any(u => u.Email == registerDto.Email))
            return Conflict(new { message = "Bu e-posta zaten kayıtlı." });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        var user = new User
        {
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            Role = string.IsNullOrEmpty(registerDto.Role) ? "User" : registerDto.Role
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { message = "Kullanıcı başarıyla oluşturuldu", userId = user.Id });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        if (loginDto == null)
            return BadRequest(new { message = "Geçersiz istek: boş veri gönderildi." });

        var user = _context.Users.FirstOrDefault(u => u.Email == loginDto.Email);
        if (user == null)
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        var token = GenerateJwtToken(user);
        if (token == null)
            return StatusCode(500, new { message = "Token oluşturulamadı." });

        return Ok(new
        {
            token = token,
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            }
        });
    }


    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });

            int userId = int.Parse(userIdClaim);

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Profil bilgileri alınırken bir hata oluştu.", error = ex.Message });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expireDays = int.Parse(jwtSettings["ExpireDays"] ?? "7");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),


            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),


            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName ?? ""),
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expireDays),
            signingCredentials: credentials
        );

        Console.WriteLine($"✅ JWT oluşturuldu → ID: {user.Id}, Email: {user.Email}");

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
