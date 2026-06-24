export default function AuditLogsCard({ children, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";

  return (
    <div
      className={`relative mx-auto w-full min-w-0 max-w-[96rem] overflow-hidden rounded-[2rem] backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 ease-out min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] ${
        isDarkMode
          ? "border border-white/10 shadow-[0_32px_90px_-54px_rgba(2,6,23,0.9)]"
          : "border border-white/70 shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] transition-opacity duration-500 ease-out ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(33,21,30,0.92))] transition-opacity duration-500 ease-out ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_24%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_38%)] transition-opacity duration-500 ease-out ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.12),transparent_24%),linear-gradient(180deg,rgba(123,13,21,0.1),transparent_38%)] transition-opacity duration-500 ease-out ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}