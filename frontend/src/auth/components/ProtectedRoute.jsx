import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthState("denied");
        return;
      }

      try {
        await authService.checkSession();
        setAuthState("allowed");
      } catch (err) {
        localStorage.removeItem("access_token");
        setAuthState("denied");
      }
    };

    validate();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#991b1b] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (authState === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}