import { useNavigate } from "react-router-dom";

export default function Navbar({ sidebarOpen }) {
  const navigate = useNavigate();
  const desktopOffset = sidebarOpen ? "lg:left-64" : "lg:left-20";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-20 h-16 sm:h-24 bg-[#991b1b] shadow flex items-center px-3 sm:px-6 justify-between transition-all duration-300 ${desktopOffset}`}
    >
      <div className="flex items-center">
        <div className="flex flex-col items-start text-white leading-tight">
          <div className="font-bold text-[0.6rem] sm:text-[1.1em] tracking-[0.5px] sm:tracking-[1px]">
            PUP TAGUIG IDENTITY PROVIDER
          </div>
          <div className="text-[0.45rem] sm:text-[0.75em] opacity-90">
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES — TAGUIG CAMPUS
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => navigate("/idp/profile")} className="group relative flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-black/30 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 sm:w-11 sm:h-11 text-white transition-transform duration-300 group-hover:scale-110">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-white font-semibold transition-colors text-xs sm:text-sm md:text-base duration-300 group-hover:text-yellow-300">John Doe</span>
            <span className="text-[10px] sm:text-xs text-yellow-300 transition-all duration-300 group-hover:text-white group-hover:tracking-wide">SuperAdmin</span>
          </div>
        </button>
      </div>
    </nav>
  );
}
