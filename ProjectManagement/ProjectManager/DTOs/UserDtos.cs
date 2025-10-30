using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs
{
    public class RegisterDto
    {
        [Required, StringLength(100)]
        public string Username { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
