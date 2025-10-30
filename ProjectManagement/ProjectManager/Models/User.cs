using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProjectManager.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        // Navigation property
        public List<Project> Projects { get; set; }
    }
}
