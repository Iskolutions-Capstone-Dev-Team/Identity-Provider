import { useEffect } from "react";
import LoginHeader from "../components/LoginHeader";
import LoginFooter from "../components/LoginFooter";
import { authPageBackground, authPagePatternStyle } from "../utils/authBackground";
import { clearAccessibilityWidget } from "../../components/AccessibilityWidget";
import { Badge } from "@/components/ui/badge";
import DotField from "@/components/ui/DotField";

export default function AuthLayout({ children, allowPageScroll = false }) {
  useEffect(() => {
    clearAccessibilityWidget();
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden font-[Poppins] text-white ${
        allowPageScroll ? "" : "lg:h-screen lg:overflow-hidden"
      }`}
      style={{ background: authPageBackground }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="rgba(255, 255, 255, 0.22)"
          gradientTo="rgba(255, 255, 255, 0.08)"
          glowColor="rgba(0, 0, 0, 0.2)"
        />
      </div>

      <div className={`relative z-10 mx-auto flex min-h-screen w-full max-w-7xl 2xl:max-w-[84rem] flex-col px-3.5 py-3.5 sm:px-8 sm:py-6 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(26rem,32rem)] xl:grid-cols-[minmax(0,1.2fr)_minmax(28rem,34rem)] lg:items-stretch lg:gap-8 xl:gap-12 lg:px-10 lg:py-7 ${
          allowPageScroll ? "" : "lg:h-screen lg:min-h-0"
        }`}
      >
        <aside className="flex flex-col lg:min-h-0">
          <LoginHeader />

          <div className="hidden flex-1 items-center lg:flex lg:py-0">
            <section className="max-w-full lg:max-w-[34rem]">
              <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl xl:text-5xl text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] whitespace-nowrap">
                Welcome <span className="text-[#ffd21a]">PUPTian!</span>
              </h1>

              <div className="mt-4 h-1.5 w-20 rounded-full bg-[#ffd21a] lg:mt-6" />

              <p className="text-sm leading-7 [&:not(:first-child)]:mt-5 text-white/65 max-w-[500px]">
                One secure gateway for connected PUPT applications, services, and platforms.
              </p>

              <div className="mt-4 flex flex-wrap gap-3 lg:mt-6">
                <Badge variant="outline" className="rounded-full border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 hover:bg-white/20">
                  Centralized Access
                </Badge>
                <Badge variant="outline" className="rounded-full border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 hover:bg-white/20">
                  Single Sign-On
                </Badge>
              </div>
            </section>
          </div>

          <div className="hidden lg:block">
            <LoginFooter />
          </div>
        </aside>

        <main className={`mt-4 flex w-full flex-1 items-center justify-center pb-4 sm:mt-8 sm:pb-8 lg:mt-0 lg:min-h-0 ${
            allowPageScroll ? "lg:py-8" : "lg:pb-0"
          }`}
        >
          {children}
        </main>

        <div className="mt-auto pt-2 pb-1 lg:hidden">
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}