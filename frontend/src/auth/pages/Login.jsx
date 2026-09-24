import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AuthLayout from "../layouts/AuthLayout";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import LoginForm from "../components/LoginForm";
import LoginMfaFlow from "../components/LoginMfaFlow";
import AccessDenied from "./AccessDenied";
import { buildLoginPath, getLoginClientId, getLoginErrorCode, getLoginErrorMessage, getLoginRedirectUri, isLoginMfaRequested, LOGIN_ERROR_CODES } from "../utils/loginRoute";
import { DEFAULT_AUTHENTICATED_PATH } from "../utils/authAccess";
import { hasStoredAccessToken } from "../utils/authRecovery";
import { clearAuthState } from "../utils/authCookies";
import { hasMfaChallengePending, hasMfaVerified } from "../utils/mfaFlow";
import { buildClientAuthorizeUrl, redirectToAuthorize } from "../utils/authorizeFlow";
import { authService } from "../services/authService";

const authClientId = import.meta.env.VITE_CLIENT_ID ?? "";

function needsMfaVerification() {
  return hasMfaChallengePending() && !hasMfaVerified();
}

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const redirectUri = getLoginRedirectUri(searchParams);
  const isClientLoginFlow =
    Boolean(clientId) &&
    (clientId !== authClientId || Boolean(redirectUri));
  const loginErrorCode = getLoginErrorCode(searchParams);
  const isAccessDeniedError = loginErrorCode === LOGIN_ERROR_CODES.UNAUTHORIZED;
  const loginErrorMessage = isAccessDeniedError
    ? ""
    : getLoginErrorMessage(searchParams);
  const [mfaContext, setMfaContext] = useState(null);
  const isMfaRequested = isLoginMfaRequested(searchParams);
  const [hasPendingMfa, setHasPendingMfa] = useState(needsMfaVerification);
  const shouldShowMfa =
    Boolean(mfaContext) || isMfaRequested || hasPendingMfa;
  const [isReturningToLogin, setIsReturningToLogin] = useState(false);
  const [isResolvingAccess, setIsResolvingAccess] = useState(
    Boolean(clientId) && !loginErrorCode,
  );

  useEffect(() => {
    const syncPendingMfa = () => {
      setHasPendingMfa(needsMfaVerification());
    };

    window.addEventListener("pageshow", syncPendingMfa);
    window.addEventListener("storage", syncPendingMfa);

    return () => {
      window.removeEventListener("pageshow", syncPendingMfa);
      window.removeEventListener("storage", syncPendingMfa);
    };
  }, []);

  const { data: session, isError: isSessionError } = useQuery({
    queryKey: ['loginSessionCheck', clientId],
    queryFn: () => authService.checkSession(),
    enabled: Boolean(
      isResolvingAccess &&
      isClientLoginFlow &&
      !hasStoredAccessToken() &&
      !isMfaRequested &&
      !hasPendingMfa &&
      !loginErrorCode &&
      clientId
    ),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isResolvingAccess) return;

    if (!clientId || loginErrorCode) {
      setIsResolvingAccess(false);
      return;
    }

    if (isMfaRequested || hasPendingMfa) {
      setIsResolvingAccess(false);
      return;
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

        return;
      }

      window.location.replace(DEFAULT_AUTHENTICATED_PATH);
      return;
    }

    if (!isClientLoginFlow) {
      setIsResolvingAccess(false);
      return;
    }

    if (session) {
      if (session.authenticated) {
        const didRedirect = redirectToAuthorize(
          clientId,
          DEFAULT_AUTHENTICATED_PATH,
          redirectUri,
        );

        if (!didRedirect) {
          setIsResolvingAccess(false);
        }
      } else {
        setIsResolvingAccess(false);
      }
    }

    if (isSessionError) {
      setIsResolvingAccess(false);
    }
  }, [
    clientId,
    hasPendingMfa,
    isClientLoginFlow,
    isMfaRequested,
    loginErrorCode,
    redirectUri,
    session,
    isSessionError,
    isResolvingAccess
  ]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      let userId = "";
      try {
        const currentSession = await queryClient.fetchQuery({
          queryKey: ['loginSessionCheck', clientId],
          queryFn: () => authService.checkSession()
        });
        userId = currentSession?.user_id || "";
      } catch (e) {
        // ignore
      }

      if (userId) {
        await authService.logout({
          clientId,
          userId,
        });
      }
    },
    onSettled: () => {
      clearAuthState();
      setMfaContext(null);
      setHasPendingMfa(false);
      setIsReturningToLogin(false);
      navigate(buildLoginPath(clientId, { redirectUri }), { replace: true });
    }
  });

  const handleBackToLogin = () => {
    if (isReturningToLogin) {
      return;
    }

    setIsReturningToLogin(true);
    logoutMutation.mutate();
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

  if (isResolvingAccess && !loginErrorCode) {
    return <AuthLoadingScreen message="Preparing Sign-In..." />;
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
          isReturningToLogin={isReturningToLogin}
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