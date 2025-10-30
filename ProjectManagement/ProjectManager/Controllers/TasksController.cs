using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.Models;
using System.Security.Claims;

namespace ProjectManager.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper method to get userId from JWT
        private bool TryGetUserId(out int userId)
        {
            var userIdClaim = User.FindFirstValue("userId")
                              ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(userIdClaim, out userId);
        }
        // get tasks for a project
        [HttpGet("projects/{projectId}/tasks")]
        public async Task<IActionResult> GetTasks(int projectId)
        {
            // Console.WriteLine("Start at backend");
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid user token");

            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null) return Unauthorized("Project not found or not yours");

            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            return Ok(tasks);
        }

        // create task
        [HttpPost("projects/{projectId}/tasks")]
        public async Task<IActionResult> CreateTask(int projectId, [FromBody] TaskItem task)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid user token");

            var project = await _context.Projects
                .Where(p => p.Id == projectId && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null) return Unauthorized("Project not found or not yours");

            task.ProjectId = projectId;

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        // update task
        [HttpPut("tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, [FromBody] TaskItem updated)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid user token");

            var task = await _context.Tasks
                .Include(t => t.Project)
                .Where(t => t.Id == taskId && t.Project.UserId == userId)
                .FirstOrDefaultAsync();

            if (task == null) return Unauthorized("Task not found or not yours");

            task.Title = updated.Title ?? task.Title;
            task.DueDate = updated.DueDate ?? task.DueDate;
            task.IsCompleted = updated.IsCompleted;

            await _context.SaveChangesAsync();
            return Ok(task);
        }

        //delete task
        [HttpDelete("tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid user token");

            var task = await _context.Tasks
                .Include(t => t.Project)
                .Where(t => t.Id == taskId && t.Project.UserId == userId)
                .FirstOrDefaultAsync();

            if (task == null) return Unauthorized("Task not found or not yours");

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok("Task deleted successfully");
        }
    }
}
