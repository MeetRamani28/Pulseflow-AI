import { Routes, Route, Link } from "react-router-dom";
import { Activity } from "lucide-react";

const Dashboard = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold">Dashboard</h2>
    <p>Live multi-task AI view coming in Step 17...</p>
  </div>
);
const Login = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold">Login</h2>
    <p>Auth view...</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <Activity className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Pulseflow
            </span>
          </Link>
          <nav>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
