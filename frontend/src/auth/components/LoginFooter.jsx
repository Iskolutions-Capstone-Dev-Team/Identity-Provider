export default function LoginFooter() {
  return (
    <footer className="bg-[#991b1b] text-white p-10 px-25">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-6 md:gap-10">
        <aside className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
          <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-4">
            <div>
              <img
                src="/assets/images/IDP_Logo.png"
                alt="PUP IDP Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-[1.6em] font-bold">PUPT IDP 2026</h2>
              <p className="text-sm text-[#facc15] font-bold">Identity Provider System</p>
            </div>
          </div>
          <p className="text-base text-justify mb-6 w-75 sm:w-150">
            Polytechnic University of the Philippines Taguig Identity Provider System (PUPT IDP) — 
            a centralized authentication platform designed to provide secure, accessible, and unified digital identity management 
            across all PUPT systems.
          </p>
          <p className="text-[.85rem] w-100">
            © 2026 <span className="font-bold">Polytechnic University of the Philippines</span><br />
            All rights reserved. PUPT IDP System.
          </p>
        </aside>

        <nav className="flex flex-col items-center md:items-end text-center md:text-right">
          <h6 className="footer-title text-lg mb-2 font-semibold">Stay Connected</h6>
          <div className="grid grid-flow-col gap-2 mb-2">
            <a href="https://www.facebook.com/PUPTaguig" target="_blank" rel="noopener noreferrer" className="group bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-all duration-300 hover:scale-105">
              <svg class="w-6 h-6 mx-auto text-white group-hover:text-yellow-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@PUPTaguigOfficial" target="_blank" rel="noopener noreferrer" className="group bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-all duration-300 hover:scale-105">
              <svg class="w-6 h-6 mx-auto text-white group-hover:text-yellow-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </a>
          </div>
          <p className="text-gray-300 text-sm mt-1">Follow us for updates</p>
        </nav>
      </div>

      <div className="mt-6 flex justify-center gap-2 text-[.46rem] sm:text-[.85rem] opacity-90 text-center">
        <a href="https://www.pup.edu.ph/privacy/" className="hover:text-yellow-400 font-bold">Privacy Policy</a>
        <span>•</span>
        <a href="https://www.pup.edu.ph/terms/" className="hover:text-yellow-400 font-bold">Terms of Service</a>
        <span>•</span>
        <a href="#" className="hover:text-yellow-400 font-bold">Feedback</a>
      </div>
    </footer>
  );
}
