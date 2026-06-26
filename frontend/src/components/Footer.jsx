import { FacebookIcon, YouTubeIcon } from "./componentIcons";

export default function Footer() {
  return (
    <footer className="bg-[#991b1b] text-white p-10 px-25  ">
      {/* Top Row: Left & Right Sections */}
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-6 md:gap-10">
        {/* Left Section: Info about PUPT IDP */}
        <aside className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
          <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-4">
            <div>
              <img
                src="/assets/images/PUPIDP-logo.png"
                alt="PUP IDP Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-[1.6em] font-bold">PUPT IDP 2025</h2>
              <p className="text-sm text-[#facc15] font-bold">Identity Provider System</p>
            </div>
          </div>
          <p className="text-base text-justify mb-6 w-75 sm:w-150">
            Polytechnic University of the Philippines Taguig Identity Provider System (PUPT IDP) — 
            a centralized authentication platform designed to provide secure, accessible, and unified digital identity management 
            across all PUPT systems.
          </p>
          <p className="text-[.85rem] w-100">
            © 2025 <span className="font-bold">Polytechnic University of the Philippines</span><br />
            All rights reserved. PUPT IDP Management System.
          </p>
        </aside>

        <nav className="flex flex-col items-center md:items-end text-center md:text-right">
          <h6 className="footer-title text-lg mb-2 font-semibold">Stay Connected</h6>
          <div className="grid grid-flow-col gap-2 mb-2">
            <a href="https://www.facebook.com/PUPTaguig" target="_blank" rel="noopener noreferrer" className="group bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-all duration-300 hover:scale-105">
              <FacebookIcon className="w-6 h-6 mx-auto text-white group-hover:text-yellow-400 transition-colors" />
            </a>
            <a href="https://www.youtube.com/@PUPTaguigOfficial" target="_blank" rel="noopener noreferrer" className="group bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-all duration-300 hover:scale-105">
              <YouTubeIcon className="w-6 h-6 mx-auto text-white group-hover:text-yellow-300 transition-colors" />
            </a>
          </div>
          <p className="text-gray-300 text-sm mt-1">Follow us for updates</p>
        </nav>
      </div>

      <div className="mt-6 flex justify-center gap-2 text-[.46rem] sm:text-[.85rem] opacity-90 text-center">
        <a href="#" className="hover:text-yellow-400 font-bold">Privacy Policy</a>
        <span>•</span>
        <a href="#" className="hover:text-yellow-400 font-bold">Terms of Service</a>
        <span>•</span>
        <a href="#" className="hover:text-yellow-400 font-bold">Feedback</a>
      </div>
    </footer>
  );
}
