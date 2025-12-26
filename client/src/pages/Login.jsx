import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/auth";

export default function Login() {
  const [activeTab, setActiveTab] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      const user = res.data.user;

      login(res.data.token, user);

    
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          Login
        </h2>

        {/* Role Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange("customer")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === "customer"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleTabChange("owner")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === "owner"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => handleTabChange("admin")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === "admin"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Admin
          </button>
        </div>

    
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          {activeTab === "customer" && (
            <p className="text-sm text-blue-700">
              <strong>Customer Portal:</strong> For ordering food from restaurants
            </p>
          )}
          {activeTab === "owner" && (
            <p className="text-sm text-blue-700">
              <strong>Restaurant Owner Portal:</strong> For managing your restaurants and menu
            </p>
          )}
          {activeTab === "admin" && (
            <p className="text-sm text-blue-700">
              <strong>Admin Portal:</strong> For platform management and restaurant approvals
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-orange-500 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-orange-500 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Login
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-500 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
