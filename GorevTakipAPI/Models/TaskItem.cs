namespace GorevTakipAPI.Models;

public class TaskItem
{
    [System.ComponentModel.DataAnnotations.Key]
    public int Id { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsCompleted { get; set; } = false;

    [System.ComponentModel.DataAnnotations.Required]
    public DateTime StartDate { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    public DateTime EndDate { get; set; }

    [System.ComponentModel.DataAnnotations.Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    public int? UserAssignedId { get; set; }
    public User? UserAssigned { get; set; }
}