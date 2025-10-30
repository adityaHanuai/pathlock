import type { Task } from "../types/Task";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  // Display message if no tasks are present
  if (tasks.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-400 text-lg">
          No tasks yet. Add one to get started!
        </p>
      </div>
    );
  }

  // Render the list of tasks

  return (
    <ul className="w-full max-w-2xl mx-auto space-y-2 p-4">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 group"
        >
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => onToggle(task.id, !task.isCompleted)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span
            className={`flex-1 text-gray-700 transition duration-200 ${
              task.isCompleted ? "line-through text-gray-400" : ""
            }`}
          >
            {task.description}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="px-4 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 opacity-0 group-hover:opacity-100"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
