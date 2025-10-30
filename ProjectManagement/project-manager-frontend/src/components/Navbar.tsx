import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-y-3 md:gap-y-0 sticky top-0 z-30">
      <Link to="/dashboard" className="text-2xl md:text-3xl font-black tracking-tight text-blue-600 hover:text-blue-700 transition-colors duration-150">
        Project Manager
      </Link>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors">
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-5 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 transition-all text-base"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
