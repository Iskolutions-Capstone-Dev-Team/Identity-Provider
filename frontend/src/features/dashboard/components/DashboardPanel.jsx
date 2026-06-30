export default function DashboardPanel({ children, colorMode = "light", className = "" }) {
  const isDarkMode = colorMode === "dark";
  const toneClassName = isDarkMode
    ? "border-white/10 bg-[#07172b]/72 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.85)]"
    : "border-white/70 bg-white/80 shadow-[0_24px_70px_-48px_rgba(43,3,7,0.45)]";

  return (
    <section className={`rounded-2xl border backdrop-blur-2xl ${toneClassName} ${className}`}>
      {children}
    </section>
  );
}
