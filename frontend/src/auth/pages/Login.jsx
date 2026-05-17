import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/LoginForm";
import AccessDenied from "./AccessDenied";
import { buildLoginPath, getLoginClientId, getLoginErrorCode, getLoginErrorMessage, LOGIN_ERROR_CODES } from "../utils/loginRoute";
import { DEFAULT_AUTHENTICATED_PATH } from "../utils/authAccess";
import { hasStoredAccessToken } from "../utils/authRecovery";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const loginErrorCode = getLoginErrorCode(searchParams);
  const isAccessDeniedError = loginErrorCode === LOGIN_ERROR_CODES.UNAUTHORIZED;
  const loginErrorMessage = isAccessDeniedError
    ? ""
    : getLoginErrorMessage(searchParams);
  const [isResolvingAccess, setIsResolvingAccess] = useState(
    Boolean(clientId) && !loginErrorCode,
  );

  useEffect(() => {
    if (!clientId || loginErrorCode) {
      setIsResolvingAccess(false);
      return;
    }

    if (hasStoredAccessToken()) {
      navigate(DEFAULT_AUTHENTICATED_PATH, { replace: true });
      return;
    }

    setIsResolvingAccess(false);
  }, [clientId, loginErrorCode, navigate]);

  if (isAccessDeniedError) {
    return <AccessDenied />;
  }

  if (!searchParams.get("client_id") && clientId) {
    return (
      <Navigate
        to={buildLoginPath(clientId, { authError: loginErrorCode })}
        replace
      />
    );
  }

  if (isResolvingAccess) {
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
            Preparing Sign-In...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <LoginForm clientId={clientId} initialError={loginErrorMessage} />
    </AuthLayout>
  );
}