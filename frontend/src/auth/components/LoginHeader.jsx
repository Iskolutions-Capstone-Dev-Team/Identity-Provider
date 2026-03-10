export default function LoginHeader() {
  return (
    <header className="w-full">
      <div className="flex min-h-[5.5rem] w-full items-center rounded-[2rem] border border-white/20 bg-white/10 px-4 py-3 shadow-[0_28px_60px_-36px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-6 lg:px-8">
        <img
          src="/assets/images/PUP_Logo.png"
          alt="PUP Logo"
          className="h-12 w-12 object-contain sm:h-14 sm:w-14"
        />

        <div className="ml-4 flex min-w-0 flex-col text-center sm:text-left">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white sm:text-base lg:text-[1.05rem]">
            PUP TAGUIG IDENTITY PROVIDER
          </div>
          <div className="mt-1 text-[0.66rem] uppercase tracking-[0.18em] text-white/70 sm:text-[0.74rem]">
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES - TAGUIG CAMPUS
          </div>
        </div>
      </div>
    </header>
  );
}
