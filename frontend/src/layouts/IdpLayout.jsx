import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useSidebarState from "../hooks/useSidebarState";
import TermsAgreementModal from "../components/TermAgreementModal";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function IdpLayout() {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebarState();
  const [openTerms, setOpenTerms] = useState(false);
  const { currentUser, isLoadingCurrentUser } = useCurrentUser();

  useEffect(() => {
    const accepted = sessionStorage.getItem("termsAccepted") === "true";
    if (!accepted) setOpenTerms(true);
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem("termsAccepted", "true");
    setOpenTerms(false);
  };

  const handleClose = () => {
    setOpenTerms(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-200 text-gray-800 font-[Poppins]">
      <TermsAgreementModal
        open={openTerms}
        onClose={handleClose}
        onContinue={handleContinue}
        privacyHref="/privacy"
        termsHref="/terms"
      />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Navbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          currentUser={currentUser}
          isLoadingCurrentUser={isLoadingCurrentUser}
        />
        <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-28 pb-28 lg:pb-6">
          <Outlet context={{ currentUser, isLoadingCurrentUser }} />
        </main>
      </div>
    </div>
  );
}
