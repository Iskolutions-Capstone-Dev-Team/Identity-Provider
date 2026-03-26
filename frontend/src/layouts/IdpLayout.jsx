import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AccessibilityWidget from "../components/AccessibilityWidget";
import ErrorAlert from "../components/ErrorAlert";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useSidebarState from "../hooks/useSidebarState";
import TermsAgreementModal from "../components/TermAgreementModal";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { DEFAULT_FORBIDDEN_ALERT_MESSAGE, IDP_FORBIDDEN_ALERT_EVENT } from "../utils/forbiddenAlert";

export default function IdpLayout() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useSidebarState();
  const [openTerms, setOpenTerms] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const [userPoolColorMode, setUserPoolColorMode] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("userPoolColorMode") === "dark"
      ? "dark"
      : "light";
  });
  const { currentUser, isLoadingCurrentUser } = useCurrentUser();
  const isUserPoolDarkMode =
    location.pathname === "/user-pool" && userPoolColorMode === "dark";

  useEffect(() => {
    const accepted = sessionStorage.getItem("termsAccepted") === "true";
    if (!accepted) setOpenTerms(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleForbiddenAlert = (event) => {
      const nextMessage =
        event?.detail?.message || DEFAULT_FORBIDDEN_ALERT_MESSAGE;
      setForbiddenMessage(nextMessage);
    };

    window.addEventListener(IDP_FORBIDDEN_ALERT_EVENT, handleForbiddenAlert);

    return () => {
      window.removeEventListener(
        IDP_FORBIDDEN_ALERT_EVENT,
        handleForbiddenAlert,
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("userPoolColorMode", userPoolColorMode);
  }, [userPoolColorMode]);

  const handleContinue = () => {
    sessionStorage.setItem("termsAccepted", "true");
    setOpenTerms(false);
  };

  const handleClose = () => {
    setOpenTerms(false);
  };

  const toggleUserPoolColorMode = () => {
    setUserPoolColorMode((current) =>
      current === "dark" ? "light" : "dark",
    );
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden font-[Poppins] transition-[background-color,color] duration-500 ease-out ${
        isUserPoolDarkMode
          ? "bg-[#111827] text-slate-100"
          : "bg-[#fff8f3] text-slate-800"
      }`}
    >
      <AccessibilityWidget />

      <div className="pointer-events-none fixed inset-x-4 top-24 z-[120] flex justify-center sm:justify-end">
        <div className="pointer-events-auto w-full max-w-sm">
          <ErrorAlert
            message={forbiddenMessage}
            onClose={() => setForbiddenMessage("")}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,13,21,0.14),transparent_33%),radial-gradient(circle_at_bottom_right,rgba(248,210,78,0.18),transparent_28%),linear-gradient(180deg,#fffaf6_0%,#f8efe8_48%,#f1e4de_100%)] transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,210,78,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(123,13,21,0.2),transparent_30%),linear-gradient(180deg,#101827_0%,#172233_48%,#22141d_100%)] transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`drift-glow absolute left-[-5rem] top-16 h-64 w-64 rounded-full bg-[#f8d24e]/16 blur-3xl transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`drift-glow absolute left-[-5rem] top-16 h-64 w-64 rounded-full bg-[#f8d24e]/10 blur-3xl transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`drift-glow drift-glow-delayed absolute bottom-6 right-[-6rem] h-72 w-72 rounded-full bg-[#7b0d15]/12 blur-3xl transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`drift-glow drift-glow-delayed absolute bottom-6 right-[-6rem] h-72 w-72 rounded-full bg-[#7b0d15]/20 blur-3xl transition-opacity duration-500 ease-out ${
            isUserPoolDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <TermsAgreementModal
        open={openTerms}
        onClose={handleClose}
        onContinue={handleContinue}
        privacyHref="/privacy"
        termsHref="/terms"
      />

      <div className="relative flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            sidebarOpen={sidebarOpen}
            currentUser={currentUser}
            isLoadingCurrentUser={isLoadingCurrentUser}
            userPoolColorMode={userPoolColorMode}
            toggleUserPoolColorMode={toggleUserPoolColorMode}
          />

          <main className="flex-1 px-4 pb-32 pt-28 sm:px-6 sm:pb-32 sm:pt-32 lg:px-6 lg:pb-8 lg:pt-36">
            <Outlet
              context={{
                currentUser,
                isLoadingCurrentUser,
                userPoolColorMode,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}