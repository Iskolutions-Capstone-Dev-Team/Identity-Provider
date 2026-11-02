import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { authService } from "../services/authService";
import { clearAuthState } from "../utils/authCookies";
import { authPageBackground } from "../utils/authBackground";
import DotField from "@/components/ui/DotField";
import { buildClientAuthorizeUrl, clearAuthorizeAttempt } from "../utils/authorizeFlow";
import { buildLoginPath, getLoginClientId, getLoginRedirectUri } from "../utils/loginRoute";
import { Button } from "../../components/ui/button";
import { ShieldAlert } from "lucide-react";
const ONE_PORTAL_CLIENT_ID = import.meta.env.VITE_ONE_PORTAL_CLIENT_ID ?? "";
const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL ?? "";

function getOnePortalRedirectUri() {
  if (!ONE_PORTAL_URL) {
    return "";
  }

  try {
    return new URL("/callback", ONE_PORTAL_URL).toString();
  } catch {
    return "";
  }
}

export default function AccessDenied() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const redirectUri = getLoginRedirectUri(searchParams);
  const reason = searchParams.get("reason");
  const [isClearingSession, setIsClearingSession] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      let currentUserId = "";
      try {
        const currentUser = await queryClient.fetchQuery({
          queryKey: ['currentUserAccessDenied'],
          queryFn: () => userService.getMe()
        });
        currentUserId = currentUser?.id;
      } catch (e) {
        // ignore
      }

      if (currentUserId) {
        await authService.logout({
          clientId,
          userId: currentUserId,
        });
      }
    },
    onSettled: (data, error) => {
      if (error) {
        console.error("Unable to clear session before login return:", error);
      }
      clearAuthState();
      window.location.replace(buildLoginPath(clientId, { redirectUri, authError: "cleared" }));
    }
  });

  const handleReturnToLogin = () => {
    if (isClearingSession) {
      return;
    }

    setIsClearingSession(true);
    clearAuthorizeAttempt();
    logoutMutation.mutate();
  };

  const handleGoToOnePortal = () => {
    clearAuthorizeAttempt();

    const authorizeUrl = buildClientAuthorizeUrl(
      ONE_PORTAL_CLIENT_ID,
      getOnePortalRedirectUri(),
    );

    if (authorizeUrl) {
      window.location.replace(authorizeUrl);
      return;
    }

    console.error(
      "Unable to authorize One Portal. Check VITE_ONE_PORTAL_CLIENT_ID and VITE_ONE_PORTAL_URL.",
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden font-[Poppins] text-white" style={{ background: authPageBackground }}>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="rgba(255, 255, 255, 0.22)"
          gradientTo="rgba(255, 255, 255, 0.08)"
          glowColor="rgba(0, 0, 0, 0.2)"
        />
        <div className="pointer-events-none absolute inset-0 opacity-45 [mask-image:linear-gradient(90deg,#000_0%,transparent_24%,transparent_76%,#000_100%)]" />
      </div>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
          <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="relative z-10 w-24 sm:w-28"/>
        </div>

        {reason === "suspended" ? (
          <div className="mt-6 max-w-md space-y-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 p-5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-[#ffd700]">
              <ShieldAlert className="size-5 text-amber-400" />
              <h1 className="text-base font-bold tracking-wide text-white">
                Account Suspended
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-white/85">
              Suspicious location activity was detected on your account. An alert was sent to your registered email.
            </p>
            <p className="text-xs text-white/60">
              Please contact your administrator to reactivate your account.
            </p>
          </div>
        ) : (
          <div className="mt-7 max-w-2xl">
            <p className="text-sm font-medium uppercase leading-7 tracking-widest text-white/85">
              You do not have access to this service. You can proceed to One Portal instead.
            </p>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={handleReturnToLogin}
            disabled={isClearingSession}
            className="h-12 w-full rounded-lg border border-[#ffd700] bg-white/10 px-6 text-[#ffd700] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition duration-300 hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white sm:w-auto sm:min-w-40"
          >
            {isClearingSession ? "Returning..." : "Return to login"}
          </Button>
          {reason === "suspended" ? (
            <a
              href="mailto:support@pup.edu.ph?subject=Account%20Suspension%20Inquiry"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-[#ffd700] bg-[#ffd700] px-6 text-sm font-semibold text-[#7b0d15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.65)] transition duration-300 hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white sm:w-auto sm:min-w-44"
            >
              Contact Support
            </a>
          ) : (
            <Button
              type="button"
              onClick={handleGoToOnePortal}
              className="h-12 w-full rounded-lg border border-[#ffd700] bg-[#ffd700] px-6 text-[#7b0d15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.65)] transition duration-300 hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white sm:w-auto sm:min-w-44"
            >
              Go to One Portal
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}