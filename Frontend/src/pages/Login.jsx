import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        },
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Login failed. (Did you register this user yet?)",
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
}
