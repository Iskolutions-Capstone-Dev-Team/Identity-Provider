import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { authService } from "../services/authService";
import { storeTokenResponse } from "../utils/authCookies";
import { buildAccessDeniedPath, buildLoginPath } from "../utils/loginRoute";
import { clearAuthorizeAttempt, clearAuthorizeReturnPath, consumeAuthorizeReturnPath } from "../utils/authorizeFlow";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuth = async () => {
      const code = searchParams.get("code");

      if (!code) {
        clearAuthorizeAttempt();
        clearAuthorizeReturnPath();
        navigate(buildLoginPath(), { replace: true });
        return;
      }

      try {
        const tokenResponse = await authService.exchangeCode(code);

        if (!tokenResponse?.access_token) {
          throw new Error("Token exchange did not return an access token.");
        }

        storeTokenResponse(tokenResponse);
        clearAuthorizeAttempt();
        sessionStorage.removeItem("termsAccepted");
        const returnPath = consumeAuthorizeReturnPath();

        setTimeout(() => {
          navigate(returnPath, { replace: true });
        }, 1000);
      } catch (err) {
        console.error(err);
        clearAuthorizeAttempt();
        clearAuthorizeReturnPath();
        navigate(buildAccessDeniedPath(), { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return <AuthLoadingScreen message="Signing You In" />;
}