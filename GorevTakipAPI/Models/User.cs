
using System.ComponentModel.DataAnnotations;


namespace GorevTakipAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";


    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
  ErrorMessage = "Email formatı geçersiz. Örnek: kullanici@domain.com")]
    public string Email { get; set; } = "";

    public string Role { get; set; } = "";
    public string PasswordHash { get; set; } = "";


    public ICollection<TaskItem>? Tasks { get; set; }
}