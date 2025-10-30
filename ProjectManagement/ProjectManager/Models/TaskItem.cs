using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Collections.Generic;

namespace ProjectManager.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; } = false;

        public List<string> Dependencies { get; set; } = new List<string>();

        public int EstimatedHours { get; set; } = 1;

        // Foreign key
        public int ProjectId { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public Project Project { get; set; }
    }
}
