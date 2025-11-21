using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GorevTakipAPI.Abstracts;

public interface IUserService
{
    IEnumerable<User> GetAllUser();
    User? GetUserById(int id);
    User AddUser(User task);
    User? UpdateUser(User updatedTask);
    bool DeleteUser(int id);

}