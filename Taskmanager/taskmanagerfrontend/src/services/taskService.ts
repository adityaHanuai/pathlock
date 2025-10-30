import axios from "axios";
import type { Task } from "../types/Task";

const API_URL = "http://localhost:5245/api/tasks"; // backend URL

// Fetch all tasks
export const getTasks = async () => {
  const response = await axios.get<Task[]>(API_URL);
  return response.data;
};

// Add a new task
export const addTask = async (description: string) => {
  const response = await axios.post<Task>(API_URL, {
    description,
    isCompleted: false,
  });
  return response.data;
};

// Update an existing task
export const updateTask = async (id: string, updatedTask: Partial<Task>) => {
  const response = await axios.put<Task>(`${API_URL}/${id}`, updatedTask);
  return response.data;
};

// Delete a task
export const deleteTask = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
