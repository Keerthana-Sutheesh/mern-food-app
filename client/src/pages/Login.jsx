import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/auth";

export default function Login() {
  const [activeTab, setActiveTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser({ email, password });
      const user = res.data.user;

    
      if (user.role !== activeTab) {
        return setError(
          `You are registered as "${user.role}". Please login from the correct tab.`
        );
      }

      login(res.data.token, user);

     
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "owner":
          navigate("/owner");
          break;
        default:
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
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          Login
        </h2>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {["user", "owner", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => handleTabChange(role)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === role
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

   
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          {activeTab === "user" && (
            <p><strong>User Portal:</strong> Order food from restaurants</p>
          )}
          {activeTab === "owner" && (
            <p><strong>Owner Portal:</strong> Manage restaurant & menu</p>
          )}
          {activeTab === "admin" && (
            <p><strong>Admin Portal:</strong> Platform management</p>
          )}
        </div>

       
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-orange-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-orange-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Login
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-500 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
