import { useEffect } from "react";
import LoginHeader from "../components/LoginHeader";
import LoginFooter from "../components/LoginFooter";
import { clearAccessibilityWidget } from "../../components/AccessibilityWidget";

export default function AuthLayout({ children, allowPageScroll = false }) {
  useEffect(() => {
    clearAccessibilityWidget();
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden bg-[#250508] font-[Poppins] text-white ${
        allowPageScroll ? "" : "lg:h-screen lg:overflow-hidden"
      }`}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#210306]/82 via-[#7b0d15]/68 to-[#230407]/86" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_46%,rgba(248,210,78,0.1),transparent_22%),linear-gradient(90deg,rgba(37,5,8,0.04),rgba(37,5,8,0.24))]" />
      </div>

      <div className={`relative mx-auto flex min-h-screen w-full max-w-[92rem] flex-col px-5 py-5 sm:px-8 lg:grid lg:grid-cols-[minmax(28rem,1fr)_minmax(27rem,35rem)] lg:items-stretch lg:gap-6 lg:px-10 lg:py-7 xl:grid-cols-[minmax(32rem,1fr)_minmax(30rem,37rem)] xl:gap-8 ${
          allowPageScroll ? "" : "lg:h-screen lg:min-h-0"
        }`}
      >
        <aside className="flex flex-col lg:min-h-0">
          <LoginHeader />

          <div className="hidden flex-1 items-center lg:flex lg:py-0">
            <section className="max-w-full lg:max-w-[34rem]">
              <h1 className="whitespace-nowrap text-[clamp(2rem,5vw,3.15rem)] font-bold leading-[1.05] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
                Welcome <span className="text-[#ffd21a]">PUPTian!</span>
              </h1>

              <div className="mt-5 h-1.5 w-20 rounded-full bg-[#ffd21a] lg:mt-7" />

              <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base lg:mt-7">
                One secure gateway for connected PUPT applications, services, and platforms.
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 lg:mt-6">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Secure access
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                  Unified login
                </span>
              </div>
            </section>
          </div>

          <div className="hidden lg:block">
            <LoginFooter />
          </div>
        </aside>

        <main className={`mt-8 flex w-full justify-center pb-8 sm:mt-10 lg:mt-0 lg:min-h-0 ${
            allowPageScroll ? "items-start lg:py-8" : "items-center lg:pb-0"
          }`}
        >
          {children}
        </main>

        <div className="mt-10 lg:hidden">
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}