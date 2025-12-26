import { useNavigate } from "react-router-dom";

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">Access Denied 🚫</h1>
      <p className="mt-2 text-gray-600">
        You don't have permission to access this page
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
      >
        Go Home
      </button>
    </div>
  );
}
