import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ensureValidAccessToken } from "../utils/tokenRefresh";
import { buildLoginPath } from "../utils/loginRoute";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
    const validate = async () => {
      try {
        await authService.checkSession();
        const accessToken = await ensureValidAccessToken();
        setAuthState(accessToken ? "allowed" : "denied");
      } catch {
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
    return <Navigate to={buildLoginPath()} replace />;
  }

  return children;
}