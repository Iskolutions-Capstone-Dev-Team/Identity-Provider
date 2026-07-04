import { useState, useEffect } from "react";
import { getModalTransitionClassName, useModalTransition } from "../../../components/modalTransition";
import { getModalTheme } from "../../../components/modalTheme";
import Pagination from "../../../components/Pagination";
import { EmptyActivityIcon } from "./DashboardIcons";

const DEFAULT_CLIENT_IMAGE = "/assets/images/PUP_Logo.png";
const ITEMS_PER_PAGE = 5;

function ClientLogo({ client }) {
  const [imageSrc, setImageSrc] = useState(client.image_url || DEFAULT_CLIENT_IMAGE);

  useEffect(() => {
    setImageSrc(client.image_url || DEFAULT_CLIENT_IMAGE);
  }, [client.image_url]);

  return (
    <img src={imageSrc} alt="" className="h-8 w-8 rounded-lg object-cover" onError={() => setImageSrc(DEFAULT_CLIENT_IMAGE)} />
  );
}

function SystemLoginRow({ client, colorMode }) {
  const isDarkMode = colorMode === "dark";
  const loginCount = Number(client.login_count) || 0;

  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 ${
      isDarkMode ? "border-white/10 bg-white/[0.04]" : "border-[#7b0d15]/10 bg-white/70"
    }`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-1 ${
          isDarkMode ? "border-white/10 bg-white/[0.04]" : "border-[#7b0d15]/10 bg-white"
        }`}>
          <ClientLogo client={client} />
        </span>
        <div className="min-w-0 text-left">
          <p className={`truncate text-sm font-semibold ${
            isDarkMode ? "text-white" : "text-[#2a1518]"
          }`}>
            {client.client_name || "Unnamed Client"}
          </p>
          <p className={`truncate text-xs ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {client.client_id || "No client ID"}
          </p>
        </div>
      </div>
      <div className="pl-4 text-right">
        <p className={`text-lg font-black ${
          isDarkMode ? "text-[#f8d24e]" : "text-[#7b0d15]"
        }`}>
          {loginCount.toLocaleString()}
        </p>
        <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
          logins
        </p>
      </div>
    </div>
  );
}

export default function SystemLoginsModal({ open, period, colorMode = "light", onClose }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const [currentPage, setCurrentPage] = useState(1);

  const isDarkMode = colorMode === "dark";
  const {
    modalBoxClassName,
    modalCloseButtonClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalHeaderDescriptionClassName,
    modalOverlayClassName,
    modalBodyClassName,
    modalBodyStackClassName,
  } = getModalTheme(colorMode);
  
  const scrollClassName = isDarkMode
    ? "[scrollbar-width:thin] [scrollbar-color:rgba(248,210,78,0.58)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/55 hover:[&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/75"
    : "[scrollbar-width:thin] [scrollbar-color:rgba(123,13,21,0.5)_rgba(123,13,21,0.08)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#7b0d15]/[0.08] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/70";

  const plainColorClassName = isDarkMode ? "text-[#ffe28a]" : "text-[#fff0a8]";

  // Reset page when period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [period]);

  if (!shouldRender || !period) {
    return null;
  }

  const clients = period.topClients || [];
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <span className={`inline-flex shrink-0 items-center justify-center ${plainColorClassName}`} aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                </svg>
              </span>
              <div>
                <h3 className={modalHeaderTitleClassName}>
                  {period.shortLabel?.toLowerCase().includes("today") ? "Today's Logins" : "Monthly Logins"}
                </h3>
                <p className={modalHeaderDescriptionClassName}>
                  Successful logins per application.
                </p>
              </div>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className={modalBodyStackClassName}>
            <div className={`mt-2 overflow-y-auto px-1 ${scrollClassName}`}>
              <div className="flex flex-col gap-3 pb-2 text-left">
                {displayedClients.length > 0 ? (
                  displayedClients.map((client) => (
                    <SystemLoginRow 
                      key={client.client_id || client.client_name} 
                      client={client} 
                      colorMode={colorMode} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <EmptyActivityIcon className="mb-2 h-6 w-6 text-slate-400" />
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      No login activity available for this period.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-2 flex justify-center pb-2 [&>div]:!justify-center">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  variant="glass"
                  colorMode={colorMode}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
