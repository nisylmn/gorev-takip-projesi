using GorevTakipAPI.Data;
using GorevTakipAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GorevTakipAPI.Abstracts;

public interface ITaskService
{
    IEnumerable<TaskItem> GetAllTasks();
    TaskItem? GetTaskById(int id);
    TaskItem AddTask(TaskItem task);
    TaskItem? UpdateTask(TaskItem updatedTask);
    bool DeleteTask(int id);
}
