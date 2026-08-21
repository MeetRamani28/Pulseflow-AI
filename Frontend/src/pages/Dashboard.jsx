import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { Send, Clock, CheckCircle2, AlertCircle, Hand } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => console.error("Failed to fetch tasks", err));
  }, [token]);

  const handleTaskUpdate = useCallback((updatedTask) => {
    setTasks((prevTasks) => {
      return prevTasks.map((t) =>
        t.thread_id === updatedTask.thread_id ? updatedTask : t,
      );
    });
  }, []);

  useSocket(userId, handleTaskUpdate);

  const submitTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks`,
        { task: newTaskText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks((prev) => [res.data.task, ...prev]);
      setNewTaskText("");
    } catch (err) {
      console.error("Task submission failed", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500 h-5 w-5" />;
      case "completed":
        return <CheckCircle2 className="text-green-500 h-5 w-5" />;
      case "failed":
        return <AlertCircle className="text-red-500 h-5 w-5" />;
      case "paused_for_hitl":
        return <Hand className="text-orange-500 h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">New AI Task</h2>
        <form onSubmit={submitTask} className="flex gap-4">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="e.g., Search the web for recent news on SpaceX and summarize it..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
          >
            <Send className="h-4 w-4" /> Execute
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.thread_id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">
                {task.task_description}
              </span>
              <div className="flex items-center gap-2 text-sm font-medium capitalize">
                {getStatusIcon(task.status)}
                <span className="text-gray-600">
                  {task.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {task.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                {task.result}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
