import { authPageBackground, authPagePatternStyle } from "../utils/authBackground";

export default function AuthLoadingScreen({ message, spinnerOnly = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden font-[Poppins] text-white" style={{ background: authPageBackground }}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-45 [mask-image:linear-gradient(90deg,#000_0%,transparent_24%,transparent_76%,#000_100%)]" style={authPagePatternStyle}/>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {spinnerOnly ? (
          <span className="loading loading-spinner loading-lg text-[#ffd21a]" aria-label="Loading" />
        ) : (
          <>
            <div className="relative flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
              <span className="loading loading-ring loading-xl absolute inset-0 h-full w-full text-[#ffd21a]/75" aria-hidden="true" />
              <span className="absolute inset-5 rounded-full border border-[#ffd21a]/20" aria-hidden="true" />
              <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="relative z-10 w-24 sm:w-28"/>
            </div>

            {message && (
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-white/85 sm:text-sm">
                {message}
              </p>
            )}

            <span className="loading loading-dots loading-md mt-3 text-[#ffd21a]" aria-label="Loading" />
          </>
        )}
      </div>
    </div>
  );
}