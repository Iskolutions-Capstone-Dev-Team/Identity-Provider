import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TermsAgreementModal from "../components/TermsAgreementModal";

export default function IdpLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

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
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6"><Outlet /></main>
      </div>
    </div>
  );
}