export default function LoginFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center justify-center gap-4 border-t border-white/15 pt-4 sm:flex-row sm:gap-12 lg:mx-0 lg:justify-start">
        <aside className="flex items-center justify-center gap-4 text-center sm:justify-start sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
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
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.011 10.125 11.927v-8.438H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.688 4.533-4.688 1.313 0 2.686.235 2.686.235v2.962H15.83c-1.491 0-1.956.93-1.956 1.885v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.084 24 18.093 24 12.073Z" />
              </svg>
            </a>
            <a href="mailto:csc.puptaguig@gmail.com" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:border-[#f8d24e]/50 hover:bg-white/15 hover:text-[#ffd700]" aria-label="Email csc.puptaguig@gmail.com">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}