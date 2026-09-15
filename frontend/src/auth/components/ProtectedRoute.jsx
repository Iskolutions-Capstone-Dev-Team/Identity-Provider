import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthLoadingScreen from "./AuthLoadingScreen";
import { clearAuthState } from "../utils/authCookies";
import { rememberAuthorizeReturnPath } from "../utils/authorizeFlow";
import { buildAccessDeniedPath, buildLoginPath } from "../utils/loginRoute";
import { userService } from "../../services/userService";
import { hasAssignedRoles } from "../utils/authAccess";
import { hasStoredAccessToken, hasStoredAuthTokens } from "../utils/authRecovery";
import { hasMfaChallengePending, hasMfaVerified, isMfaPath, rememberMfaReturnPath } from "../utils/mfaFlow";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("loading");
  const location = useLocation();
  const returnPath =
    `${location.pathname}${location.search}${location.hash}` || "/";
  const isCurrentMfaPath = isMfaPath(location.pathname);

  const needsMfaVerification = hasMfaChallengePending() && !hasMfaVerified();
  const hasTokens = hasStoredAuthTokens();

  const { data: currentUser, isError, error, isLoading } = useQuery({
    queryKey: ['currentUserProtected'],
    queryFn: () => userService.getMe(),
    enabled: hasTokens && (!needsMfaVerification || isCurrentMfaPath),
    retry: false
  });

  useEffect(() => {
    if (!isCurrentMfaPath && needsMfaVerification) {
      rememberMfaReturnPath(returnPath);
      setAuthState("needs-mfa");
      return;
    }

    if (!hasTokens) {
      rememberAuthorizeReturnPath(returnPath);
      setAuthState("redirect-to-sso");
      return;
    }

    if (isLoading) {
      setAuthState("loading");
      return;
    }

    if (isError) {
      if (error?.response?.status === 403) {
        setAuthState("unauthorized");
        return;
      }

      clearAuthState();
      rememberAuthorizeReturnPath(returnPath);

      if (error?.response?.status === 401) {
        setAuthState("redirect-to-sso");
        return;
      }

      setAuthState("denied");
      return;
    }

    if (currentUser) {
      if (!hasAssignedRoles(currentUser)) {
        setAuthState("unauthorized");
        return;
      }

      const hasCompletedMfa =
        hasMfaVerified() ||
        (hasStoredAccessToken() && !hasMfaChallengePending());

      if (!isCurrentMfaPath && !hasCompletedMfa) {
        rememberMfaReturnPath(returnPath);
        setAuthState("needs-mfa");
        return;
      }

      setAuthState("allowed");
    }
  }, [
    isCurrentMfaPath,
    needsMfaVerification,
    hasTokens,
    isLoading,
    isError,
    error,
    currentUser,
    returnPath
  ]);

  if (authState === "loading") {
    return <AuthLoadingScreen message="Loading..." />;
  }

  if (authState === "denied") {
    return <Navigate to={buildLoginPath()} replace />;
  }

  if (authState === "redirect-to-sso") {
    return <Navigate to="/" replace />;
  }

  if (authState === "unauthorized") {
    return <Navigate to={buildAccessDeniedPath()} replace />;
  }

  if (authState === "needs-mfa") {
    return <Navigate to={buildLoginPath(undefined, { showMfa: true })} replace />;
  }

  return children;
}