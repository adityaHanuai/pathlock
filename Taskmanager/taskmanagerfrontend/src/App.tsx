import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import type { Task } from "./types/Task";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "./services/taskService";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.isCompleted;
    if (filter === "active") return !task.isCompleted;
    return true;
  });

  // Load tasks when app starts
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      fetchTasks(); // load from backend if nothing in storage
    }
  }, []);

  // Save tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  // Add a new task
  const handleAdd = async (description: string) => {
    const newTask = await addTask(description);
    setTasks((prev) => [...prev, newTask]);
  };

  // Toggle task completion
  const handleToggle = async (id: string, isCompleted: boolean) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = await updateTask(id, {
      ...task,
      isCompleted,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  // Delete a task
  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-3">
          <span>Task Manager</span>
        </h1>

        <TaskForm onAdd={handleAdd} />

        <div className="flex justify-center gap-2 my-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              filter === "active"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              filter === "completed"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Completed
          </button>
        </div>

        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
