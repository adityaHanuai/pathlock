using TaskManagerApi.Models;

namespace TaskManagerApi.Services
{
    public class TaskService
    {
        private readonly List<TaskItem> _tasks = new();

        // CRUD Operations

        //  Get all tasks
        public List<TaskItem> GetAll() => _tasks;

        // Get task by ID
        public TaskItem Add(TaskItem task)
        {
            task.Id = Guid.NewGuid();
            _tasks.Add(task);
            return task;
        }

        // Update task by ID
        public TaskItem? Update(Guid id, TaskItem updatedTask)
        {
            var existingTask = _tasks.FirstOrDefault(t => t.Id == id);
            if (existingTask != null)
            {
                existingTask.Description = updatedTask.Description;
                existingTask.IsCompleted = updatedTask.IsCompleted;
            }
            return existingTask;
        }


        // Delete task by ID
        public bool Delete(Guid id)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task != null)
            {
                _tasks.Remove(task);
                return true;
            }
            return false;
        }
    }
}
