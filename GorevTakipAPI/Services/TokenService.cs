using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GorevTakipAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace GorevTakipAPI.Services;

public interface ITokenService
{
    string CreateToken(User user);
}

public class TokenService : ITokenService
{

    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)

    {
        _config = config;
    }

    public string CreateToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

        var tokenDescriptor = new SecurityTokenDescriptor

        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(Convert.ToInt32(_config["Jwt:ExpireDays"])),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
        };


        var Token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(Token);
    }
}

