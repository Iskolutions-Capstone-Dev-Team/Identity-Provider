import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const doLogout = async () => {
      try {
        if (clientId && userId) {
          await authService.logout({
            clientId,
            userId,
          });
        } else {
          console.warn("Skipping logout API call because logout query params are incomplete.");
        }
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        clearAuthState();
        setTimeout(() => navigate(buildLoginPath(clientId), { replace: true }), 500);
      }
    };

    doLogout();
  }, [clientId, navigate, userId]);

  return <AuthLoadingScreen message="Signing You Out" />;
}