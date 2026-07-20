import { useEffect, useState, Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import AssistiveFab from "../components/AssistiveFab";
import AccessibilityWidget from "../components/AccessibilityWidget";
import ErrorAlert from "../components/ErrorAlert";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { AppSidebar } from "../components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import TermsAgreementModal from "../components/TermAgreementModal";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { DEFAULT_FORBIDDEN_ALERT_MESSAGE, IDP_FORBIDDEN_ALERT_EVENT } from "../utils/forbiddenAlert";

import { TooltipProvider } from "@/components/ui/tooltip";

export default function IdpLayout() {
  const location = useLocation();
  const [openTerms, setOpenTerms] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const [colorMode, setColorMode] = useState(() => {
    if (typeof window === "undefined") return "light";
    const storedColorMode = window.localStorage.getItem("idpColorMode");
    if (storedColorMode === "dark" || storedColorMode === "light") return storedColorMode;
    const legacyUserPoolColorMode = window.localStorage.getItem("userPoolColorMode");
    const legacyAppClientColorMode = window.localStorage.getItem("appClientColorMode");
    return legacyUserPoolColorMode === "dark" || legacyAppClientColorMode === "dark" ? "dark" : "light";
  });
  
  const { currentUser, isLoadingCurrentUser, updateCurrentUser } = useCurrentUser();
  const showColorModeToggle = true;

  useEffect(() => {
    const accepted = sessionStorage.getItem("termsAccepted") === "true";
    if (!accepted) setOpenTerms(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleForbiddenAlert = (event) => {
      const nextMessage = event?.detail?.message || DEFAULT_FORBIDDEN_ALERT_MESSAGE;
      setForbiddenMessage(nextMessage);
    };
    window.addEventListener(IDP_FORBIDDEN_ALERT_EVENT, handleForbiddenAlert);
    return () => window.removeEventListener(IDP_FORBIDDEN_ALERT_EVENT, handleForbiddenAlert);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("idpColorMode", colorMode);
    window.localStorage.setItem("userPoolColorMode", colorMode);
    window.localStorage.setItem("appClientColorMode", colorMode);
    
    // Apply Tailwind dark mode class to html element for Shadcn
    if (colorMode === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = ""; // Reset inline styles
      document.body.style.color = "";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  }, [colorMode]);

  const handleContinue = () => {
    sessionStorage.setItem("termsAccepted", "true");
    setOpenTerms(false);
  };

  const handleClose = () => {
    setOpenTerms(false);
  };

  const handleToggleColorMode = () => {
    setColorMode((current) => (current === "dark" ? "light" : "dark"));
  };
  
  const outlet = useOutlet({
    currentUser,
    isLoadingCurrentUser,
    updateCurrentUser,
    colorMode,
    userPoolColorMode: colorMode,
    appClientColorMode: colorMode,
  });

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AccessibilityWidget colorMode={colorMode} />
        <AssistiveFab colorMode={colorMode} />

        <div className="pointer-events-none fixed inset-x-4 top-24 z-[120] flex justify-center sm:justify-end">
          <div className="pointer-events-auto w-full max-w-sm">
            <ErrorAlert
              message={forbiddenMessage}
              onClose={() => setForbiddenMessage("")}
            />
          </div>
        </div>

        <TermsAgreementModal
          open={openTerms}
          onClose={handleClose}
          onContinue={handleContinue}
          colorMode={colorMode}
          currentUser={currentUser}
          privacyHref="/privacy"
          termsHref="/terms"
        />

        <AppSidebar currentUser={currentUser} />

        <SidebarInset className="font-[Poppins] text-foreground overflow-hidden">
          <div className="relative z-40 shrink-0 border-b flex items-center px-4">
            <div className="flex-1">
              <Navbar
                activeColorMode={colorMode}
                onToggleColorMode={handleToggleColorMode}
                showColorModeToggle={showColorModeToggle}
                currentUser={currentUser}
              />
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <PageTransition pageKey={location.pathname}>
              <Suspense fallback={
                <div className="flex min-h-[60vh] w-full items-center justify-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="bg-[#7b0d15] dark:bg-white size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-[#7b0d15] dark:bg-white size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-[#7b0d15] dark:bg-white size-2 animate-bounce rounded-full" />
                  </div>
                </div>
              }>
                {outlet}
              </Suspense>
            </PageTransition>
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
