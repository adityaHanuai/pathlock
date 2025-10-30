import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
  projectId: number;
  dueDate: string; // ✅ added
  dependencies?: string[];
  estimatedHours?: number;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState(""); // added
  const [estimatedHours, setEstimatedHours] = useState<number>(1);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleOrder, setScheduleOrder] = useState<string[] | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    estimatedHours?: string;
  }>({});

  // Validation helpers
  const isFutureOrToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= today.getTime();
  };

  // Form validation
  const validateForm = () => {
    const next: typeof errors = {};
    if (!newTask.trim()) next.title = "Task name is required";
    if (!dueDate) next.dueDate = "Due date is required";
    else if (!isFutureOrToday(dueDate))
      next.dueDate = "Due date cannot be in the past";
    if (!estimatedHours || Number.isNaN(estimatedHours))
      next.estimatedHours = "Estimated hours is required";
    else if (estimatedHours < 1)
      next.estimatedHours = "Estimated hours must be at least 1";
    else if (!Number.isInteger(estimatedHours))
      next.estimatedHours = "Estimated hours must be an integer";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Fetch tasks for the project
  const fetchTasks = async () => {
    if (!id) return;

    // console.log("fetching the tasks");
    const res = await axiosClient.get(`/projects/${id}/tasks`);
    // console.log("tasked fetched sucessfully");
    setTasks(res.data);
  };

  // Add a new task
  const addTask = async () => {
    if (!validateForm()) return;
    // Map dependency IDs to titles for backend compatibility
    const dependencyTitles = dependencies
      .map((depId) => {
        const found = tasks.find((t) => t.id === depId);
        return found ? found.title : null;
      })
      .filter(Boolean);
    await axiosClient.post(`/projects/${id}/tasks`, {
      title: newTask,
      isCompleted: false,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || 1,
      dependencies: dependencyTitles,
    });
    setNewTask("");
    setDueDate("");
    setEstimatedHours(1);
    setDependencies([]);
    setErrors({});
    fetchTasks();
  };

  // Update task status
  const updateStatus = async (task: Task, isCompleted: boolean) => {
    await axiosClient.put(`/tasks/${task.id}`, {
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      isCompleted,
      dueDate: task.dueDate,
    });
    fetchTasks();
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    await axiosClient.delete(`/tasks/${taskId}`);
    fetchTasks();
  };

  // Trigger smart scheduling
  const triggerSmartSchedule = async () => {
    if (!id) return;
    setScheduleLoading(true);
    setScheduleError(null);
    setScheduleOrder(null);
    // Prepare tasks data for scheduling
    try {
      const res = await axiosClient.post(`/v1/projects/${id}/schedule`, {
        tasks: tasks.map((t) => ({
          title: t.title,
          estimatedHours: t.estimatedHours || 1,
          dueDate: t.dueDate,
          dependencies: t.dependencies || [],
        })),
      });

      setScheduleOrder(res.data.recommendedOrder);
    } catch (err: any) {
      setScheduleError(
        err?.response?.data?.error ||
          "Could not generate schedule, check dependencies."
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  // Fetch tasks on component mount or when project ID changes
  useEffect(() => {
    // console.log("fetching the tasks");
    fetchTasks();
  }, [id]);

  // Define task board columns
  const columns = [
    { key: "todo", title: "To-Do", filter: (t: Task) => !t.isCompleted },
    { key: "done", title: "Completed", filter: (t: Task) => t.isCompleted },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-black text-blue-700 mb-6 tracking-tight">
        Project Tasks
      </h2>
      {/* New Task Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex flex-wrap gap-6 items-end max-w-3xl mx-auto">
        <div className="flex flex-col flex-1 min-w-[180px]">
          <span className="text-xs font-semibold text-gray-500 mb-1">
            Task Name <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            placeholder="Write task..."
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            className={`border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
            }`}
          />
          {errors.title && (
            <span className="text-xs text-red-600 mt-1">{errors.title}</span>
          )}
        </div>
        <div className="flex flex-col min-w-[140px]">
          <span className="text-xs font-semibold text-gray-500 mb-1">
            Due Date <span className="text-red-500">*</span>
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (errors.dueDate)
                setErrors((prev) => ({ ...prev, dueDate: undefined }));
            }}
            className={`border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors.dueDate
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
            }`}
          />
          {errors.dueDate && (
            <span className="text-xs text-red-600 mt-1">{errors.dueDate}</span>
          )}
        </div>
        <div className="flex flex-col min-w-[100px]">
          <span className="text-xs font-semibold text-gray-500 mb-1">
            Estimated Hours <span className="text-red-500">*</span>
          </span>
          <input
            type="number"
            min={1}
            value={estimatedHours}
            onChange={(e) => {
              const v = Number(e.target.value);
              setEstimatedHours(v);
              if (errors.estimatedHours)
                setErrors((prev) => ({ ...prev, estimatedHours: undefined }));
            }}
            className={`border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors.estimatedHours
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
            }`}
            placeholder="Est. Hours"
          />
          {errors.estimatedHours && (
            <span className="text-xs text-red-600 mt-1">
              {errors.estimatedHours}
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-[160px]">
          <span className="text-xs font-semibold text-gray-500 mb-1">
            Dependencies
          </span>
          <div className="flex flex-col gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 max-h-20 overflow-auto min-w-[120px]">
            {tasks.length === 0 ? (
              <span className="text-xs text-gray-400">No tasks</span>
            ) : (
              tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={dependencies.includes(task.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDependencies((prev) => [...prev, task.id]);
                      } else {
                        setDependencies((prev) =>
                          prev.filter((id) => id !== task.id)
                        );
                      }
                    }}
                    className="accent-blue-600"
                    disabled={task.title === newTask}
                  />
                  {task.title}
                </label>
              ))
            )}
          </div>
        </div>
        <button
          onClick={addTask}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition mt-6 ml-1"
          disabled={
            !newTask.trim() ||
            !dueDate ||
            !isFutureOrToday(dueDate) ||
            !estimatedHours ||
            !Number.isInteger(estimatedHours) ||
            estimatedHours < 1
          }
        >
          Add Task
        </button>
      </div>
      {/* Smart Schedule: highlight card format */}
      <div className="bg-blue-100/60 border border-blue-200 rounded-2xl shadow mb-10 px-6 py-5 max-w-3xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h4 className="font-bold text-lg text-blue-700 mb-1">
            Smart Schedule
          </h4>
          <p className="text-gray-600 text-xs mb-3 md:mb-0">
            Automatically optimize your tasks based on dependencies and
            estimated time.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <button
            onClick={triggerSmartSchedule}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:from-green-600 hover:to-emerald-700 transition text-base"
            disabled={scheduleLoading}
          >
            {scheduleLoading ? "Scheduling..." : "Run Smart Scheduler"}
          </button>
          {scheduleError && (
            <span className="text-red-500 text-xs font-semibold">
              {scheduleError}
            </span>
          )}
        </div>
      </div>
      {/* Schedule Output */}
      {scheduleOrder && (
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg max-w-3xl mx-auto">
          <b className="block mb-2">Recommended Task Order:</b>
          <ol className="list-decimal list-inside ml-3 mt-2 space-y-1">
            {scheduleOrder.map((title, i) => (
              <li key={i} className="text-blue-700 font-semibold">
                {title}
              </li>
            ))}
          </ol>
        </div>
      )}
      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {columns.map((col) => (
          <div
            key={col.key}
            className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 rounded-2xl shadow h-fit"
          >
            <h3 className="font-semibold text-lg mb-4 text-blue-700 border-b border-blue-200 pb-2">
              {col.title}
            </h3>
            {tasks.filter(col.filter).length === 0 ? (
              <div className="text-gray-400 italic">No tasks</div>
            ) : (
              tasks.filter(col.filter).map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl shadow mb-5"
                >
                  <span className="font-bold text-base text-blue-950 truncate inline-block max-w-[80%]">
                    {task.title}
                  </span>{" "}
                  {typeof task.estimatedHours === "number" && (
                    <span className="ml-2 inline-block text-xs bg-gray-200 px-2 py-0.5 rounded">
                      est. {task.estimatedHours}h
                    </span>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {/* (Optional) Show dependencies */}
                  {Array.isArray(task.dependencies) &&
                    task.dependencies.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Depends on:{" "}
                        {task.dependencies
                          .map((depId) => {
                            const depTask = tasks.find(
                              (t) => t.id === Number(depId)
                            );
                            return depTask ? depTask.title : depId;
                          })
                          .join(", ")}
                      </p>
                    )}
                  <div className="flex gap-2 text-xs mt-3">
                    {task.isCompleted ? (
                      <button
                        onClick={() => updateStatus(task, false)}
                        className="px-3 py-1 border rounded text-gray-600 border-gray-300 hover:bg-gray-100"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(task, true)}
                        className="px-3 py-1 border rounded bg-green-500 text-white border-green-400 hover:bg-green-600"
                      >
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
