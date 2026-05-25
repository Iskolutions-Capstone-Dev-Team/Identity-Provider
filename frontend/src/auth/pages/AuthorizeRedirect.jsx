import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { buildLoginPath } from "../utils/loginRoute";
import { hasStoredAccessToken } from "../utils/authRecovery";
import { clearAuthorizeAttempt, getAuthorizeReturnPath, redirectToAuthorize } from "../utils/authorizeFlow";
import { hasMfaChallengePending, hasMfaVerified, rememberMfaReturnPath } from "../utils/mfaFlow";

const authClientId = import.meta.env.VITE_CLIENT_ID ?? "";

export default function AuthorizeRedirect() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const redirectToNextPage = () => {
      const returnPath = getAuthorizeReturnPath();

      if (hasMfaChallengePending() && !hasMfaVerified()) {
        rememberMfaReturnPath(returnPath);
        navigate(buildLoginPath(authClientId, { showMfa: true }), {
          replace: true,
        });
        return;
      }

      if (hasStoredAccessToken()) {
        clearAuthorizeAttempt();
        navigate(returnPath, { replace: true });
        return;
      }

      const didRedirect = redirectToAuthorize(
        authClientId,
        returnPath,
      );

      if (didRedirect) {
        return;
      }

      navigate(buildLoginPath(authClientId), { replace: true });
    };

    redirectToNextPage();
  }, [navigate]);

  return <AuthLoadingScreen message="Loading..." />;
}