import { useNavigate } from "react-router-dom";
import { formatCurrentUserName } from "../hooks/useCurrentUser";

export default function Navbar({
  sidebarOpen,
  currentUser,
  isLoadingCurrentUser,
}) {
  const navigate = useNavigate();
  const desktopOffsetClassName = sidebarOpen ? "lg:left-80" : "lg:left-32";
  const profileName = isLoadingCurrentUser
    ? "Loading..."
    : formatCurrentUserName(currentUser);

  return (
    <nav className={`fixed left-4 right-4 top-4 z-20 overflow-hidden rounded-[1.85rem] border border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.92),rgba(43,3,7,0.96))] shadow-[0_28px_80px_-38px_rgba(15,23,42,0.95)] backdrop-blur-2xl transition-all duration-300 sm:top-5 lg:right-6 ${desktopOffsetClassName}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_32%)]" />

      <div className="relative flex min-h-[4.75rem] items-center justify-between gap-4 px-4 py-3 sm:min-h-[5.25rem] sm:px-6">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white sm:text-[0.7rem] lg:text-[0.76rem]">
            PUP TAGUIG IDENTITY PROVIDER
          </p>
          <p className="mt-1 truncate text-[0.58rem] text-white/72 sm:text-[0.68rem] lg:text-[0.76rem]">
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES &mdash; TAGUIG CAMPUS
          </p>
        </div>

        <button onClick={() => navigate("/profile")} className="group flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.08] px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:border-[#f8d24e]/25 hover:bg-white/[0.14] sm:px-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 shrink-0 text-white transition duration-300 group-hover:scale-[1.03] group-hover:text-[#f8d24e]">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd"/>
          </svg>

          <span className="max-w-[8.5rem] truncate text-sm font-semibold text-white transition duration-300 group-hover:text-[#f8d24e] sm:max-w-[12rem] sm:text-[0.95rem]">
            {profileName}
          </span>
        </button>
      </div>
    </nav>
  );
}