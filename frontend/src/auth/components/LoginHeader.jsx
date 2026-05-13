export default function LoginHeader() {
  return (
    <header className="w-full">
      <div className="flex min-h-[4.5rem] w-full items-center px-0 py-1">
        <img src="/assets/images/PUP_Logo.png" alt="PUP Logo" className="h-14 w-14 object-contain sm:h-16 sm:w-16"/>

        <div className="ml-4 flex min-w-0 flex-col text-left">
          <div className="text-lg font-bold uppercase tracking-[0.26em] text-white sm:text-xl">
            Identity Provider
          </div>
          <div className="mt-2 max-w-[28rem] text-[0.58rem] font-light uppercase tracking-[0.18em] text-white/75 sm:text-[0.68rem] lg:max-w-none lg:whitespace-nowrap lg:text-[0.78rem]">
            Polytechnic University of the Philippines - Taguig Campus
          </div>
        </div>
      </div>
    </header>
  );
}