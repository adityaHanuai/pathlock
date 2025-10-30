import { useState } from "react";

// Props for TaskForm component
interface TaskFormProps {
  onAdd: (description: string) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [description, setDescription] = useState("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAdd(description);
    setDescription("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <input
          type="text"
          placeholder="Enter a new task"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!description.trim()}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}
