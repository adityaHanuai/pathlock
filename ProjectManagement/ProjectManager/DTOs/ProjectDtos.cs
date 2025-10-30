using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs
{
    public class ProjectCreateDto
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
    }

    public class ProjectResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string CreatedAt { get; set; }
    }
}
