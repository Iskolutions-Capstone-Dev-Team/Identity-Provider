export default function LoginFooter() {
  return (
    <footer className="w-full">
      <div className="flex w-full flex-col gap-6 rounded-[2rem] border border-white/20 bg-white/10 px-5 py-5 shadow-[0_28px_60px_-36px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <aside className="flex items-center justify-center gap-4 text-center lg:justify-start lg:text-left">
          <img
            src="/assets/images/IDP_Logo.png"
            alt="PUP IDP Logo"
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-[0.08em] text-white sm:text-2xl">
              PUPT IDP 2026
            </h2>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#f8d24e]">
              Identity Provider System
            </p>
          </div>
        </aside>

        <nav className="flex flex-col items-center gap-3 text-center lg:items-end lg:text-right">
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/PUPTaguig"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition duration-300 hover:-translate-y-1 hover:border-[#f8d24e]/50 hover:bg-white/20 hover:text-[#ffd700]"
              aria-label="Visit PUP Taguig on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.011 10.125 11.927v-8.438H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.688 4.533-4.688 1.313 0 2.686.235 2.686.235v2.962H15.83c-1.491 0-1.956.93-1.956 1.885v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.084 24 18.093 24 12.073Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@PUPTaguigOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition duration-300 hover:-translate-y-1 hover:border-[#f8d24e]/50 hover:bg-white/20 hover:text-[#ffd700]"
              aria-label="Visit PUP Taguig on YouTube"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.499 6.203a3.008 3.008 0 0 0-2.119-2.13C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.38.573A3.008 3.008 0 0 0 .501 6.203 31.687 31.687 0 0 0 0 12a31.687 31.687 0 0 0 .501 5.797 3.008 3.008 0 0 0 2.119 2.13C4.495 20.5 12 20.5 12 20.5s7.505 0 9.38-.573a3.008 3.008 0 0 0 2.119-2.13A31.688 31.688 0 0 0 24 12a31.688 31.688 0 0 0-.501-5.797ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
              </svg>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium tracking-[0.12em] text-white/70 sm:text-sm lg:justify-end">
            <a
              href="https://www.pup.edu.ph/privacy/"
              className="transition duration-300 hover:text-[#f8d24e]"
            >
              Privacy Policy
            </a>
            <span className="hidden text-white/35 sm:inline">|</span>
            <a
              href="https://www.pup.edu.ph/terms/"
              className="transition duration-300 hover:text-[#f8d24e]"
            >
              Terms of Service
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
