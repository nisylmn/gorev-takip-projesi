using System.ComponentModel.DataAnnotations;

namespace GorevTakipAPI.DTOs;

public class LoginDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}