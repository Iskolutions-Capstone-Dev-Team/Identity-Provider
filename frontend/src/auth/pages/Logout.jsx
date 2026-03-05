import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function Logout() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        
        const doLogout = async () => {
            try {
                await authService.logout();
            } catch (err) {
                console.error("Logout failed", err);
            } finally {
                document.cookie = "access_token=; Max-Age=0; path=/";
                document.cookie = "refresh_token=; Max-Age=0; path=/";
                document.cookie = "token=; Max-Age=0; path=/";
                sessionStorage.removeItem("termsAccepted");
                setTimeout(() => navigate("/", { replace: true }), 2000);
            }
        };

        doLogout();
    }, [navigate]);

  return (
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-32 md:w-50 float-logo"/>
    </div>
  );
}