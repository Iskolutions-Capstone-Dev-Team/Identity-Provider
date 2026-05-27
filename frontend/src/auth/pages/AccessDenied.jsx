import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../../services/userService";
import { authService } from "../services/authService";
import { clearAuthState } from "../utils/authCookies";
import { authPageBackground, authPagePatternStyle } from "../utils/authBackground";
import { buildClientAuthorizeUrl, clearAuthorizeAttempt } from "../utils/authorizeFlow";
import { buildLoginPath, getLoginClientId, getLoginRedirectUri } from "../utils/loginRoute";

const ONE_PORTAL_CLIENT_ID = import.meta.env.VITE_ONE_PORTAL_CLIENT_ID ?? "65b491cd-6d28-404b-85ce-a45ecd4bade0";
const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL ?? "";
const ONE_PORTAL_REDIRECT_URI = import.meta.env.VITE_ONE_PORTAL_REDIRECT_URI ?? "";

function getOnePortalRedirectUri() {
  if (ONE_PORTAL_REDIRECT_URI) {
    return ONE_PORTAL_REDIRECT_URI;
  }

  if (!ONE_PORTAL_URL) {
    return "";
  }

  try {
    return `${new URL(ONE_PORTAL_URL).origin}/callback`;
  } catch {
    return "";
  }
}

export default function AccessDenied() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const redirectUri = getLoginRedirectUri(searchParams);
  const [isClearingSession, setIsClearingSession] = useState(false);

  const handleReturnToLogin = async () => {
    if (isClearingSession) {
      return;
    }

    setIsClearingSession(true);
    clearAuthorizeAttempt();

    try {
      const currentUser = await userService.getMe();

      if (currentUser?.id) {
        await authService.logout({
          clientId,
          userId: currentUser.id,
        });
      }
    } catch (error) {
      console.error("Unable to clear session before login return:", error);
    } finally {
      clearAuthState();
      navigate(buildLoginPath(clientId, { redirectUri }), { replace: true });
    }
  };

  const handleGoToOnePortal = () => {
    clearAuthorizeAttempt();

    const authorizeUrl = buildClientAuthorizeUrl(
      ONE_PORTAL_CLIENT_ID,
      getOnePortalRedirectUri(),
    );

    if (authorizeUrl) {
      window.location.replace(authorizeUrl);
      return;
    }

    if (ONE_PORTAL_URL) {
      window.location.assign(ONE_PORTAL_URL);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden font-[Poppins] text-white" style={{ background: authPageBackground }}>
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-45 [mask-image:linear-gradient(90deg,#000_0%,transparent_24%,transparent_76%,#000_100%)]" style={authPagePatternStyle}/>
      </div>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
          <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="relative z-10 w-24 sm:w-28"/>
        </div>

        <div className="mt-7 max-w-2xl">
          <p className="text-xs font-medium uppercase leading-7 tracking-[0.28em] text-white/85 sm:text-sm">
            You do not have access to this service. You can proceed to One Portal instead.
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={handleReturnToLogin} disabled={isClearingSession} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-white/10 px-6 text-[#ffd700] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition duration-300 hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-40">
            {isClearingSession ? "Returning..." : "Return to login"}
          </button>
          <button type="button" onClick={handleGoToOnePortal} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] px-6 text-[#7b0d15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.65)] transition duration-300 hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white sm:w-auto sm:min-w-44">
            Go to One Portal
          </button>
        </div>
      </section>
    </main>
  );
}