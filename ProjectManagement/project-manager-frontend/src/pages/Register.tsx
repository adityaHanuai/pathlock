import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosClient.post("/auth/register", { username, password });
      setSuccess("Registration successful! Redirecting to login...");
      // redirect after short delay so the user can see the toast
      setTimeout(() => navigate("/login"), 1600);
    } catch {
      setError("Registration failed — user may already exist");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow">
            <div className="font-semibold">Success</div>
            <div className="text-sm">{success}</div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            type="submit"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
