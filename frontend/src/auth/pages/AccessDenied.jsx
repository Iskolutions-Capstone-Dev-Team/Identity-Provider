import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../../services/userService";
import { authService } from "../services/authService";
import { clearAuthState } from "../utils/authCookies";
import { buildLoginPath, getLoginClientId } from "../utils/loginRoute";

const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL ?? "";

export default function AccessDenied() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const [isClearingSession, setIsClearingSession] = useState(false);

  const handleCancel = async () => {
    if (isClearingSession) {
      return;
    }

    setIsClearingSession(true);

    try {
      const currentUser = await userService.getMe();

      if (currentUser?.id) {
        await authService.logout({
          clientId,
          userId: currentUser.id,
        });
      }
    } catch (error) {
      console.error("Unable to clear server session:", error);
    } finally {
      clearAuthState();
      navigate(buildLoginPath(clientId), { replace: true });
    }
  };

  const handleGoToOnePortal = () => {
    window.location.assign(ONE_PORTAL_URL);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
        <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo w-28 sm:w-32"/>

        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase leading-7 tracking-[0.28em] text-white/75 sm:text-sm">
            You do not have access to this service. Would you like to proceed to One Portal instead?
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={handleCancel} disabled={isClearingSession} className="btn h-12 w-full rounded-lg border-white/35 bg-white/10 px-6 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition duration-300 hover:border-white hover:bg-white hover:text-[#991b1b] sm:w-auto sm:min-w-40">
            {isClearingSession ? "Clearing..." : "No, back to login"}
          </button>
          <button type="button" onClick={handleGoToOnePortal} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] px-6 text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white sm:w-auto sm:min-w-44">
            Go to One Portal
          </button>
        </div>
      </div>
    </div>
  );
}