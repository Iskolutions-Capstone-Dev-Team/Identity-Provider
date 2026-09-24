import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { authService } from "../services/authService";
import { storeTokenResponse } from "../utils/authCookies";
import { buildAccessDeniedPath, buildLoginPath } from "../utils/loginRoute";
import { clearAuthorizeAttempt, clearAuthorizeReturnPath, consumeAuthorizeReturnPath } from "../utils/authorizeFlow";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const code = searchParams.get("code");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!code) {
      clearAuthorizeAttempt();
      clearAuthorizeReturnPath();
      navigate(buildLoginPath(), { replace: true });
      return;
    }

    setHasStarted(true);
  }, [code, navigate]);

  const { isSuccess, isError, data: tokenResponse, error } = useQuery({
    queryKey: ['exchangeCode', code],
    queryFn: () => authService.exchangeCode(code),
    enabled: hasStarted && !!code,
    retry: false
  });

  useEffect(() => {
    if (isSuccess) {
      if (!tokenResponse?.access_token) {
        console.error("Token exchange did not return an access token.");
        clearAuthorizeAttempt();
        clearAuthorizeReturnPath();
        navigate(buildAccessDeniedPath(), { replace: true });
        return;
      }

      storeTokenResponse(tokenResponse);
      clearAuthorizeAttempt();
      sessionStorage.removeItem("termsAccepted");
      const returnPath = consumeAuthorizeReturnPath();

      setTimeout(() => {
        navigate(returnPath, { replace: true });
      }, 1000);
    }

    if (isError) {
      console.error(error);
      clearAuthorizeAttempt();
      clearAuthorizeReturnPath();
      navigate(buildAccessDeniedPath(), { replace: true });
    }
  }, [isSuccess, isError, tokenResponse, error, navigate]);

  return <AuthLoadingScreen message="Signing You In" />;
}