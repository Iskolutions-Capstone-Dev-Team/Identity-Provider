import { EmailIcon, ShieldIcon, FacebookIcon } from "./authIcons";

export default function LoginFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center justify-center gap-4 border-t border-white/15 pt-4 sm:flex-row sm:gap-12 lg:mx-0 lg:justify-start">
        <aside className="flex items-center justify-center gap-4 text-center sm:justify-start sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center text-white">
            <ShieldIcon />
          </div>
          <div className="space-y-1.5 text-xs font-medium tracking-[0.12em] text-white/70 sm:text-sm">
            <a href="https://www.pup.edu.ph/privacy/" className="block transition duration-300 hover:text-[#f8d24e]">
              Privacy Policy
            </a>
            <a href="https://www.pup.edu.ph/terms/" className="block transition duration-300 hover:text-[#f8d24e]">
              Terms of Service
            </a>
          </div>
        </aside>

        <nav className="flex items-center justify-center border-white/25 sm:border-l sm:pl-8">
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/PUPTOFFICIAL" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:border-[#f8d24e]/50 hover:bg-white/15 hover:text-[#ffd700]" aria-label="Visit PUP Taguig on Facebook">
              <FacebookIcon />
            </a>
            <a href="mailto:csc.puptaguig@gmail.com" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:border-[#f8d24e]/50 hover:bg-white/15 hover:text-[#ffd700]" aria-label="Email csc.puptaguig@gmail.com">
              <EmailIcon className="size-5" />
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}