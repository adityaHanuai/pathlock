using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;


namespace ProjectManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Constructor
        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper method to get userId from JWT
        private int GetUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            return int.Parse(userIdClaim);
        }

        //  Create a new project
        [HttpPost]
        public IActionResult CreateProject(ProjectCreateDto dto)
        {
            var userId = GetUserId();

            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                UserId = userId
            };

            _context.Projects.Add(project);
            _context.SaveChanges();

            return Ok(new { message = "Project created successfully!", project.Id });
        }

        //  Get all projects for logged-in user
        [HttpGet]
        public IActionResult GetAllProjects()
        {
            var userId = GetUserId();
            var projects = _context.Projects
                .Where(p => p.UserId == userId)
                .Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                })
                .ToList();

            return Ok(projects);
        }
        // Get project by id
        [HttpGet("{id}")]
        public IActionResult GetProject(int id)
        {
            var userId = GetUserId();
            var project = _context.Projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound("Project not found or unauthorized access.");

            return Ok(new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CreatedAt = project.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }

        // Delete a project
        [HttpDelete("{id}")]
        public IActionResult DeleteProject(int id)
        {
            var userId = GetUserId();
            var project = _context.Projects.FirstOrDefault(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound("Project not found or unauthorized access.");

            _context.Projects.Remove(project);
            _context.SaveChanges();
            return Ok("Project deleted successfully!");
        }

        [HttpPost("/api/v1/projects/{projectId}/schedule")]
        [AllowAnonymous]
        public IActionResult SmartSchedule(int projectId, [FromBody] SchedulerInput input)
        {
            if (input?.Tasks == null || !input.Tasks.Any())
                return BadRequest("Tasks are required");

            var tasks = input.Tasks;
            var tasksByTitle = tasks.ToDictionary(t => t.Title, t => t);
            var depGraph = new Dictionary<string, List<string>>();
            var inDegree = new Dictionary<string, int>();

            // Initialize graph and in-degrees
            foreach (var task in tasks)
            {
                depGraph[task.Title] = task.Dependencies ?? new List<string>();
                inDegree[task.Title] = 0;
            }
            foreach (var task in tasks)
            {
                foreach (var dep in task.Dependencies ?? new List<string>())
                {
                    if (inDegree.ContainsKey(dep))
                        inDegree[task.Title]++;
                }
            }

            // Kahn's algorithm using due date tiebreak
            var order = new List<string>();
            var ready = new SortedSet<string>(
                inDegree.Where(kv => kv.Value == 0)
                        .Select(kv => kv.Key),
                Comparer<string>.Create((a, b) =>
                {
                    var taskA = tasksByTitle[a];
                    var taskB = tasksByTitle[b];
                    DateTime? dateA = TryParseDate(taskA.DueDate);
                    DateTime? dateB = TryParseDate(taskB.DueDate);
                    int cmp = Nullable.Compare(dateA, dateB);
                    if (cmp != 0) return cmp;
                    return string.CompareOrdinal(a, b);
                }));

            while (ready.Any())
            {
                var next = ready.Min;
                ready.Remove(next);
                order.Add(next);

                foreach (var kvp in depGraph)
                {
                    var taskTitle = kvp.Key;
                    var deps = kvp.Value;
                    if (deps.Contains(next))
                    {
                        inDegree[taskTitle]--;
                        if (inDegree[taskTitle] == 0)
                            ready.Add(taskTitle);
                    }
                }
            }

            if (order.Count != tasks.Count)
                return BadRequest(new { error = "Cyclic dependency detected." });

            return Ok(new { recommendedOrder = order });
        }

        // Utility: Try to parse date string
        private static DateTime? TryParseDate(string dateStr)
        {
            if (DateTime.TryParse(dateStr, out var dt))
                return dt;
            return null;
        }

        public class SchedulerInput
        {
            public List<SchedulerTaskDto> Tasks { get; set; }
        }
        public class SchedulerTaskDto
        {
            public string Title { get; set; }
            public int EstimatedHours { get; set; }
            public string DueDate { get; set; }
            public List<string> Dependencies { get; set; }
        }
    }
}
