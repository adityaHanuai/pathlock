import { useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  //state and context
  const { logout } = useContext(AuthContext);
  const [projects, setProjects] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

  //fetch projects
  const fetchProjects = async () => {
    const res = await axiosClient.get("/projects");
    setProjects(res.data);
  };

  //create project
  const createProject = async (e: any) => {
    e.preventDefault();
    await axiosClient.post("/projects", { title, description });
    setTitle("");
    setDescription("");
    setShowModal(false);
    fetchProjects();
  };

  //delete project
  const handleDeleteProject = async () => {
    if (projectToDelete) {
      await axiosClient.delete(`/projects/${projectToDelete.id}`);
      setProjectToDelete(null);
      fetchProjects();
    }
  };

  // fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-200 p-4 md:p-10">
      {/* Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-0">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          My Projects
        </h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 font-semibold transition"
        >
          Logout
        </button>
      </div>
      {/* Add project button */}
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-lg mb-6 shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 font-bold transition"
        onClick={() => setShowModal(true)}
      >
        + New Project
      </button>
      {/* Project grid */}
      {projects.length === 0 ? (
        <p className="text-gray-500 text-lg">No projects yet. Create one!</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-7 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col gap-2"
            >
              <h2 className="text-xl font-semibold mb-1 text-blue-800">
                {project.title}
              </h2>
              <p className="text-base text-gray-600 mb-3">
                {project.description || "No description"}
              </p>
              <div className="flex justify-between gap-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  View
                </Link>
                <button
                  onClick={() => setProjectToDelete(project)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl space-y-5">
            <h3 className="text-xl font-semibold text-blue-700">New Project</h3>
            <form onSubmit={createProject} className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 shadow-sm font-bold transition"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Project Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Delete Project
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete project{" "}
              <b>{projectToDelete.title}</b>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
