using Microsoft.AspNetCore.Mvc;
using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using System.Text.RegularExpressions;

namespace GorevTakipAPI.Controllers;

[ApiController]
[Route("api/[controller]")]

public class UserController : ControllerBase
{
    public readonly AppDbContext _context;
    private readonly Regex _emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");

    public UserController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public IActionResult GetUsers()
    {
        var User = _context.Users.ToList();
        return Ok(User);
    }

    [HttpPost]
    public IActionResult CreateUser([FromBody] User user)
    {
        if (user == null)
            return BadRequest();

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value != null && x.Value.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Messages = x.Value!.Errors.Select(e => e.ErrorMessage) })
                .ToList();
            return BadRequest(new { message = "Validation hatası", errors });
        }


        if (string.IsNullOrWhiteSpace(user.Email) || !_emailRegex.IsMatch(user.Email))
        {
            return BadRequest(new { message = "Geçerli bir email adresi giriniz. Örnek: kullanici@domain.com" });
        }


        var existingEmail = _context.Users.FirstOrDefault(u => u.Email.ToLower() == user.Email.ToLower());
        if (existingEmail != null)
        {
            return BadRequest(new { message = "Bu email adresi zaten kayıtlı." });
        }


        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(user);
    }


    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] User UpdatedUser)
    {
        var existingUser = _context.Users.Find(id);
        if (existingUser == null)
            return NotFound();

        existingUser.FullName = UpdatedUser.FullName;
        existingUser.Email = UpdatedUser.Email;
        existingUser.PasswordHash = UpdatedUser.PasswordHash;
        existingUser.Role = UpdatedUser.Role;

        _context.Update(existingUser);
        _context.SaveChanges();
        return Ok(existingUser);
    }


    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _context.Users.Find(id);
        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        _context.SaveChanges();

        return Ok(new { message = "User deleted successfully" });
    }



}