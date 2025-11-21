using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GorevTakipAPI.Data;
using GorevTakipAPI.Models;

namespace GorevTakipAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }


    [HttpGet]
    public IActionResult GetTasks()
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        if (!int.TryParse(userIdClaim, out int userId))
            return BadRequest(new { message = "Geçersiz kullanıcı ID formatı." });

        var tasks = _context.TaskItems
            .Where(t => t.UserId == userId)
            .ToList();

        Console.WriteLine($"✅ Görevler getirildi → UserId: {userId}, Toplam: {tasks.Count}");

        return Ok(tasks);
    }

    [HttpPost]
    public IActionResult AddTask([FromBody] TaskItem task)
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        var creatorId = int.Parse(userIdClaim);

        if (task.UserAssignedId == 0 || task.UserAssignedId == null)
        {
            task.UserAssignedId = null;
            task.UserId = creatorId;
        }
        else
        {
            task.UserId = creatorId;
        }

        if (task.StartDate < DateTime.Today)
            return BadRequest(new { message = "Geçmiş bir tarihe görev oluşturulamaz." });

        if (task.EndDate < task.StartDate)
            return BadRequest(new { message = "Bitiş tarihi başlangıç tarihinden önce olamaz." });


        _context.TaskItems.Add(task);
        _context.SaveChanges();

        Console.WriteLine($"✅ Görev eklendi → Oluşturan: {creatorId}, Atanan: {task.UserAssignedId}");
        return Ok(task);
    }



    [HttpGet("assigned-to/{userId}")]
    public IActionResult GetTasksAssignedToUser(int userId)
    {
        var tasks = _context.TaskItems
            .Where(t => t.UserAssignedId == userId)
            .ToList();

        Console.WriteLine($"✅ {userId} ID'li kullanıcıya atanan görevler → Toplam: {tasks.Count}");

        return Ok(tasks);
    }

    [HttpGet("assigned-to-me")]
    public IActionResult GetAssignedTasks()
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        var userId = int.Parse(userIdClaim);

        var tasks = _context.TaskItems
            .Where(t => t.UserAssignedId == userId)
            .ToList();

        return Ok(tasks);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateTask(int id, [FromBody] TaskItem updatedTask)
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        if (!int.TryParse(userIdClaim, out int userId))
            return BadRequest(new { message = "Geçersiz kullanıcı ID formatı." });

        var existingTask = _context.TaskItems.FirstOrDefault(t => t.Id == id && t.UserId == userId);
        if (existingTask == null)
            return NotFound(new { message = "Görev bulunamadı." });

        existingTask.Title = updatedTask.Title;
        existingTask.Description = updatedTask.Description;

        existingTask.StartDate = updatedTask.StartDate;
        existingTask.EndDate = updatedTask.EndDate;

        _context.SaveChanges();

        Console.WriteLine($"✏️ Görev güncellendi → TaskId: {id}, UserId: {userId}");

        return Ok(existingTask);
    }


    [HttpPut("{id}/complete")]
    public IActionResult CompleteTask(int id)
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        if (!int.TryParse(userIdClaim, out int userId))
            return BadRequest(new { message = "Geçersiz kullanıcı ID formatı." });

        var task = _context.TaskItems.FirstOrDefault(t => t.Id == id);
        if (task == null)
            return NotFound(new { message = "Görev bulunamadı." });

        if (task.UserAssignedId != userId)
            return Forbid("Bu görevi sadece atanan kullanıcı tamamlayabilir.");

        task.IsCompleted = true;
        _context.SaveChanges();

        Console.WriteLine($"✅ Görev tamamlandı → TaskId: {id}, UserId: {userId}");
        return Ok(new { message = "Görev tamamlandı olarak işaretlendi." });
    }


    [HttpPut("{id}/uncomplete")]
    public IActionResult UncompleteTask(int id)
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        if (!int.TryParse(userIdClaim, out int userId))
            return BadRequest(new { message = "Geçersiz kullanıcı ID formatı." });

        var task = _context.TaskItems.FirstOrDefault(t => t.Id == id);
        if (task == null)
            return NotFound(new { message = "Görev bulunamadı." });

        if (task.UserAssignedId != userId)
            return Forbid("Bu görevi sadece atanan kullanıcı değiştirebilir.");

        task.IsCompleted = false;
        _context.SaveChanges();

        Console.WriteLine($"↩️ Görev geri alındı → TaskId: {id}, UserId: {userId}");
        return Ok(new { message = "Görev tamamlanmadı olarak işaretlendi." });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteTask(int id)
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Kullanıcı kimliği alınamadı." });

        if (!int.TryParse(userIdClaim, out int userId))
            return BadRequest(new { message = "Geçersiz kullanıcı ID formatı." });

        var task = _context.TaskItems.FirstOrDefault(t => t.Id == id && t.UserId == userId);
        if (task == null)
            return NotFound(new { message = "Görev bulunamadı." });

        _context.TaskItems.Remove(task);
        _context.SaveChanges();

        Console.WriteLine($"🗑️ Görev silindi → TaskId: {id}, UserId: {userId}");

        return Ok(new { message = $"Task with id {id} has been deleted." });
    }
}
