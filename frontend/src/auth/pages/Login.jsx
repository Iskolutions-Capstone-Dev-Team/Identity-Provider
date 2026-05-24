import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/LoginForm";
import LoginMfaFlow from "../components/LoginMfaFlow";
import AccessDenied from "./AccessDenied";
import { buildLoginPath, getLoginClientId, getLoginErrorCode, getLoginErrorMessage, getLoginRedirectUri, isLoginMfaRequested, LOGIN_ERROR_CODES } from "../utils/loginRoute";
import { DEFAULT_AUTHENTICATED_PATH } from "../utils/authAccess";
import { hasStoredAccessToken } from "../utils/authRecovery";
import { clearAuthState } from "../utils/authCookies";
import { buildClientAuthorizeUrl, redirectToAuthorize } from "../utils/authorizeFlow";
import { authService } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const redirectUri = getLoginRedirectUri(searchParams);
  const isClientLoginFlow =
    Boolean(searchParams.get("client_id")) && Boolean(redirectUri);
  const loginErrorCode = getLoginErrorCode(searchParams);
  const isAccessDeniedError = loginErrorCode === LOGIN_ERROR_CODES.UNAUTHORIZED;
  const loginErrorMessage = isAccessDeniedError
    ? ""
    : getLoginErrorMessage(searchParams);
  const [mfaContext, setMfaContext] = useState(null);
  const isMfaRequested = isLoginMfaRequested(searchParams);
  const shouldShowMfa = Boolean(mfaContext) || isMfaRequested;
  const [isResolvingAccess, setIsResolvingAccess] = useState(
    Boolean(clientId) && !loginErrorCode,
  );

  useEffect(() => {
    let isActive = true;

    if (!clientId || loginErrorCode) {
      setIsResolvingAccess(false);
      return undefined;
    }

    if (isMfaRequested) {
      setIsResolvingAccess(false);
      return undefined;
    }

    if (hasStoredAccessToken()) {
      if (isClientLoginFlow) {
        const didRedirect = redirectToAuthorize(
          clientId,
          DEFAULT_AUTHENTICATED_PATH,
          redirectUri,
        );

        if (!didRedirect) {
          setIsResolvingAccess(false);
        }

        return undefined;
      }

      window.location.replace(DEFAULT_AUTHENTICATED_PATH);
      return undefined;
    }

    if (!isClientLoginFlow) {
      setIsResolvingAccess(false);
      return undefined;
    }

    authService
      .checkSession()
      .then((session) => {
        if (!isActive) {
          return;
        }

        if (session?.authenticated) {
          const didRedirect = redirectToAuthorize(
            clientId,
            DEFAULT_AUTHENTICATED_PATH,
            redirectUri,
          );

          if (!didRedirect) {
            setIsResolvingAccess(false);
          }

          return;
        }

        setIsResolvingAccess(false);
      })
      .catch(() => {
        if (isActive) {
          setIsResolvingAccess(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [clientId, isClientLoginFlow, isMfaRequested, loginErrorCode, redirectUri]);

  const handleBackToLogin = () => {
    clearAuthState();
    setMfaContext(null);
    navigate(buildLoginPath(clientId, { redirectUri }), { replace: true });
  };

  const handleLoginSuccess = (context) => {
    setMfaContext(context);
    navigate(buildLoginPath(clientId, { redirectUri, showMfa: true }), {
      replace: true,
    });
  };

  if (isAccessDeniedError) {
    return <AccessDenied />;
  }

  if (!searchParams.get("client_id") && clientId) {
    return (
      <Navigate
        to={buildLoginPath(clientId, {
          authError: loginErrorCode,
          redirectUri,
        })}
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
      {shouldShowMfa ? (
        <LoginMfaFlow
          clientId={clientId}
          redirectUri={redirectUri}
          callbackRedirectUrl={
            mfaContext?.redirectUrl ||
            (isClientLoginFlow
              ? buildClientAuthorizeUrl(clientId, redirectUri)
              : "")
          }
          initialEmail={mfaContext?.email || ""}
          onBackToLogin={handleBackToLogin}
        />
      ) : (
        <LoginForm
          clientId={clientId}
          redirectUri={redirectUri}
          initialError={loginErrorMessage}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </AuthLayout>
  );
}