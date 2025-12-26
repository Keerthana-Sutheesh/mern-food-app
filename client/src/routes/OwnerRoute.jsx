import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export default function OwnerRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "owner") return <Navigate to="/" />;

  return children;
}