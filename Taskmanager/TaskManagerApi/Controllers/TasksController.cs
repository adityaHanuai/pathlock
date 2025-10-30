using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Models;
using TaskManagerApi.Services;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        // Constructor of TaskService
        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // GET /api/tasks
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_taskService.GetAll());
        }

        // POST /api/tasks
        [HttpPost]
        public IActionResult Add([FromBody] TaskItem newTask)
        {
            if (string.IsNullOrWhiteSpace(newTask.Description))
                return BadRequest("Description cannot be empty.");

            var task = _taskService.Add(newTask);
            return Ok(task);
        }

        // PUT /api/tasks/{id}
        [HttpPut("{id}")]
        public IActionResult Update(Guid id, [FromBody] TaskItem updatedTask)
        {
            var task = _taskService.Update(id, updatedTask);
            if (task == null)
                return NotFound();
            return Ok(task);
        }

        // DELETE /api/tasks/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var success = _taskService.Delete(id);
            if (!success)
                return NotFound();
            return NoContent();
        }
    }
}
