import { useNavigate } from "react-router-dom";
import { MoonIcon, ProfileIcon, SunIcon } from "./componentIcons";

export default function Navbar({ activeColorMode = "light", onToggleColorMode, showColorModeToggle = false }) {
  const navigate = useNavigate();
  const isDarkMode = activeColorMode === "dark";
  const navbarTheme = isDarkMode
    ? {
        shell:
          "border-white/8 bg-[linear-gradient(135deg,rgba(27,39,56,0.95),rgba(16,24,37,0.97))] shadow-[0_28px_80px_-38px_rgba(2,6,23,0.92)]",
        shellOverlay:
          "bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.12),transparent_26%),radial-gradient(circle_at_left,rgba(123,13,21,0.18),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_36%)]",
        eyebrow: "text-slate-100",
        subtitle: "text-slate-300/78",
        iconButton:
          "border-white/8 bg-white/[0.04] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-[#f8d24e]/28 hover:bg-[#f8d24e]/10 hover:text-[#ffe28a]",
        activeToggle:
          "border-[#f8d24e]/32 bg-[linear-gradient(135deg,rgba(248,210,78,0.16),rgba(123,13,21,0.18))] text-[#f8d24e] shadow-[0_20px_40px_-26px_rgba(248,210,78,0.42)]",
      }
    : {
        shell:
          "border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.92),rgba(43,3,7,0.96))] shadow-[0_28px_80px_-38px_rgba(15,23,42,0.95)]",
        shellOverlay:
          "bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_32%)]",
        eyebrow: "text-white",
        subtitle: "text-white/72",
        iconButton:
          "border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#f8d24e]/25 hover:bg-white/[0.14] hover:text-[#f8d24e]",
        activeToggle:
          "border-[#f8d24e]/35 bg-[#f8d24e]/12 shadow-[0_18px_36px_-24px_rgba(248,210,78,0.35)]",
      };
  const iconButtonClassName = `group flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] border transition-[background-color,border-color,box-shadow,transform,color] duration-300 ease-out hover:-translate-y-0.5 sm:h-14 sm:w-14 ${navbarTheme.iconButton}`;
  const darkModeButtonClassName = `${iconButtonClassName} ${isDarkMode ? navbarTheme.activeToggle : ""}`;
  const profileIconClassName =
    "h-8 w-8 shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.03]";

  return (
    <nav className={`relative z-20 mx-4 mt-4 isolate overflow-hidden rounded-[1.85rem] border backdrop-blur-2xl transition-all duration-300 sm:mx-6 sm:mt-5 ${navbarTheme.shell}`}
      style={{
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      <div className={`pointer-events-none absolute inset-0 ${navbarTheme.shellOverlay}`} />

      <div className="relative flex min-h-[4.75rem] items-center justify-between gap-4 px-4 py-3 sm:min-h-[5.25rem] sm:px-6">
        <div className="min-w-0">
          <p className={`text-[0.62rem] font-bold uppercase tracking-[0.24em] sm:text-[0.7rem] lg:text-[0.76rem] ${navbarTheme.eyebrow}`}>
            PUP TAGUIG IDENTITY PROVIDER
          </p>
          <p className={`mt-1 truncate text-[0.58rem] sm:text-[0.68rem] lg:text-[0.76rem] ${navbarTheme.subtitle}`}>
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES &mdash; TAGUIG CAMPUS
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showColorModeToggle ? (
            <button type="button" onClick={onToggleColorMode} aria-pressed={isDarkMode}
              aria-label={
                isDarkMode
                  ? "Switch page to light mode"
                  : "Switch page to dark mode"
              }
              title={
                isDarkMode
                  ? "Switch page to light mode"
                  : "Switch page to dark mode"
              }
              className={darkModeButtonClassName}
            >
              <span className="relative h-7 w-7">
                <span aria-hidden="true"
                  className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out ${
                    isDarkMode
                      ? "scale-75 rotate-90 opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  }`}
                >
                  <MoonIcon />
                </span>
                <span aria-hidden="true"
                  className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out ${
                    isDarkMode
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-75 -rotate-90 opacity-0"
                  }`}
                >
                  <SunIcon />
                </span>
              </span>
            </button>
          ) : null}

          <button type="button" onClick={() => navigate("/profile")} aria-label="Open profile" className={iconButtonClassName}>
            <ProfileIcon className={profileIconClassName} />
          </button>
        </div>
      </div>
    </nav>
  );
}