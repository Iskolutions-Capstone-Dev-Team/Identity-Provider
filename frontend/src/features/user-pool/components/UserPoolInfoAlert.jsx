import { InfoIcon } from "./userpoolIcons";

export default function UserPoolInfoAlert({ message, colorMode = "light" }) {
  if (!message) {
    return null;
  }

  const isDarkMode = colorMode === "dark";

  const alertClassName = isDarkMode
    ? "relative w-full overflow-hidden rounded-[1.4rem] border border-[#3b82f6]/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,58,138,0.4))] text-white shadow-[0_26px_60px_-32px_rgba(29,78,216,0.56)] backdrop-blur-xl transition-all duration-300 ease-out"
    : "relative w-full overflow-hidden rounded-[1.4rem] border border-[#3b82f6]/15 bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(219,234,254,0.9))] text-[#1e3a8a] shadow-[0_16px_40px_-24px_rgba(37,99,235,0.2)] backdrop-blur-xl transition-all duration-300 ease-out";

  const glowClassName = isDarkMode
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_26%),radial-gradient(circle_at_right,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(30,58,138,0.18),transparent_34%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_right,rgba(255,255,255,0.5),transparent_28%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.06),transparent_34%)]";

  const iconClassName = isDarkMode ? "shrink-0 text-[#60a5fa] mt-[0.1rem]" : "shrink-0 text-[#2563eb] mt-[0.1rem]";
  const textClassName = isDarkMode ? "min-w-0 flex-1 break-words text-sm font-medium leading-6 text-white/88" : "min-w-0 flex-1 break-words text-sm font-medium leading-6 text-[#1e40af]";

  return (
    <div role="alert" aria-live="polite" className={alertClassName}>
      <div className={glowClassName} />

      <div className="relative flex items-start gap-3 px-4 py-4">
        <div className={iconClassName}>
          <InfoIcon />
        </div>

        <p className={textClassName}>
          {message}
        </p>
      </div>
    </div>
  );
}
