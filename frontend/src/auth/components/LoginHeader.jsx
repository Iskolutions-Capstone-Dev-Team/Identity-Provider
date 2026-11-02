export default function LoginHeader() {
  return (
    <header className="w-full">
      <div className="flex min-h-[3.5rem] sm:min-h-[4.5rem] w-full items-center px-0 py-1">
        <img src="/assets/images/PUP_Logo.png" alt="PUP Logo" className="h-11 w-11 object-contain sm:h-16 sm:w-16 shrink-0"/>

        <div className="ml-3 sm:ml-4 flex min-w-0 flex-col text-left">
          <div className="text-base sm:text-xl font-bold uppercase tracking-[0.22em] sm:tracking-[0.26em] text-white">
            Identity Provider
          </div>
          <div className="mt-1 sm:mt-2 max-w-[28rem] text-[0.52rem] font-light uppercase tracking-[0.15em] sm:tracking-[0.18em] text-white/75 sm:text-[0.68rem] lg:max-w-none lg:whitespace-nowrap lg:text-[0.78rem]">
            Polytechnic University of the Philippines - Taguig Campus
          </div>
        </div>
      </div>
    </header>
  );
}