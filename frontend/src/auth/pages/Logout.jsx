import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { clearAuthState } from "../utils/authCookies";
import { buildLoginPath } from "../utils/loginRoute";

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
        clearAuthState();
        setTimeout(() => navigate(buildLoginPath(), { replace: true }), 500);
      }
    };

    doLogout();
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
        <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-28 sm:w-32 float-logo"/>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/75 sm:text-sm">
          Signing You Out
        </p>
      </div>
    </div>
  );
}