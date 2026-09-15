import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import { authService } from "../services/authService";
import { clearAuthState } from "../utils/authCookies";
import { buildLoginPath } from "../utils/loginRoute";
import { getLogoutClientId, getLogoutUserId } from "../utils/logoutRoute";

export default function Logout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);
  const clientId = getLogoutClientId(searchParams);
  const userId = getLogoutUserId(searchParams);

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout({
      clientId,
      userId,
    }),
    onSettled: (data, error) => {
      if (error) {
        console.error("Logout failed", error);
      }
      clearAuthState();
      setTimeout(() => navigate(buildLoginPath(clientId), { replace: true }), 500);
    }
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (clientId && userId) {
      logoutMutation.mutate();
    } else {
      console.warn("Skipping logout API call because logout query params are incomplete.");
      clearAuthState();
      setTimeout(() => navigate(buildLoginPath(clientId), { replace: true }), 500);
    }
  }, [clientId, navigate, userId, logoutMutation]);

  return <AuthLoadingScreen message="Signing You Out" />;
}