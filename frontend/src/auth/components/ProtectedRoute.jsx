import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAuthState } from "../utils/authCookies";
import { rememberAuthorizeReturnPath } from "../utils/authorizeFlow";
import { buildLoginPath, buildUnauthorizedLoginPath } from "../utils/loginRoute";
import { userService } from "../../services/userService";
import { hasAssignedRoles } from "../utils/authAccess";
import { hasStoredAuthTokens } from "../utils/authRecovery";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    let isActive = true;
    const returnPath =
      `${location.pathname}${location.search}${location.hash}` || "/";

    const validate = async () => {
      if (!hasStoredAuthTokens()) {
        rememberAuthorizeReturnPath(returnPath);
        setAuthState("redirect-to-sso");
        return;
      }

      try {
        const currentUser = await userService.getMe();

        if (!isActive) {
          return;
        }

        if (!hasAssignedRoles(currentUser)) {
          clearAuthState();
          setAuthState("unauthorized");
          return;
        }

        setAuthState("allowed");
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error.response?.status === 403) {
          clearAuthState();
          setAuthState("unauthorized");
          return;
        }

        clearAuthState();
        rememberAuthorizeReturnPath(returnPath);

        if (error.response?.status === 401) {
          setAuthState("redirect-to-sso");
          return;
        }

        setAuthState("denied");
      }
    };

    validate();

    return () => {
      isActive = false;
    };
  }, [location.hash, location.pathname, location.search]);

  if (authState === "loading") {
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
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (authState === "denied") {
    return <Navigate to={buildLoginPath()} replace />;
  }

  if (authState === "redirect-to-sso") {
    return <Navigate to="/" replace />;
  }

  if (authState === "unauthorized") {
    return <Navigate to={buildUnauthorizedLoginPath()} replace />;
  }

  return children;
}