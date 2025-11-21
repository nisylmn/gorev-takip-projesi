using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using Microsoft.EntityFrameworkCore;
using GorevTakipAPI.Abstracts;



namespace GorevTakipAPI.Services;

public class UserService : IUserService
{

    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public IEnumerable<User> GetAllUser()
    {
        return _context.Users
        .ToList();
    }


    public User? GetUserById(int id)
    {
        return _context.Users
          .Include(u => u.Tasks)
         .FirstOrDefault(u => u.Id == id);


    }


    public User AddUser(User user)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        _context.Users.Add(user);
        _context.SaveChanges();
        return user;

    }


    public User? UpdateUser(User UpdatedUser)

    {
        var existingUser = _context.Users.Find(UpdatedUser.Id);
        if (existingUser == null) return null;

        existingUser.FullName = UpdatedUser.FullName;
        existingUser.Email = UpdatedUser.Email;
        existingUser.PasswordHash = UpdatedUser.PasswordHash;
        existingUser.Role = UpdatedUser.Role;
        _context.SaveChanges();
        return existingUser;
    }

    public bool DeleteUser(int id)
    {
        var user = _context.Users.Find(id);
        if (user == null) return false;
        _context.Users.Remove(user);
        _context.SaveChanges();
        return true;
    }


}