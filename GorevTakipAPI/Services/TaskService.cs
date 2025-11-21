using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using Microsoft.EntityFrameworkCore;
using GorevTakipAPI.Abstracts;
namespace GorevTakipAPI.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    public TaskService(AppDbContext context)
    { _context = context; }
    public IEnumerable<TaskItem> GetAllTasks()
    { return _context.TaskItems.Include(t => t.User).Include(t => t.UserAssigned).ToList(); }
    public TaskItem? GetTaskById(int id)
    {
        return _context.TaskItems
    .Include(t => t.User)
    .Include(t => t.UserAssigned)
    .FirstOrDefault(t => t.Id == id);
    }
    public TaskItem AddTask(TaskItem task)
    {
        _context.TaskItems.Add(task); _context.SaveChanges();
        return task;
    }
    public TaskItem? UpdateTask(TaskItem updateTask)
    {
        var task = _context.TaskItems.Find(updateTask.Id);
        if (task == null) return null;

        task.Title = updateTask.Title;
        task.Description = updateTask.Description;
        task.IsCompleted = updateTask.IsCompleted;
        task.StartDate = updateTask.StartDate;
        task.EndDate = updateTask.EndDate;
        task.UserId = updateTask.UserId;
        task.UserAssignedId = updateTask.UserAssignedId;

        _context.SaveChanges();
        return task;
    }
    public bool DeleteTask(int id)
    {
        var task = _context.TaskItems.Find(id); if (task == null) return false;
        _context.TaskItems.Remove(task); _context.SaveChanges();
        return true;
    }

}
