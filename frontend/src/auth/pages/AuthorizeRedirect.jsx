import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { buildLoginPath } from "../utils/loginRoute";

export default function AuthorizeRedirect() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const redirectBySession = async () => {
      try {
        await authService.checkSession();
        navigate("/user-pool", { replace: true });
      } catch {
        navigate(buildLoginPath(), { replace: true });
      }
    };

    redirectBySession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#991b1b] flex items-center justify-center text-white">
      Loading...
    </div>
  );
}
