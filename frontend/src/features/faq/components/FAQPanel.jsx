export default function FAQPanel({ children, className = "", theme }) {
  return (
    <section className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 ease-out ${theme.panel} ${className}`}>
      <div className={`pointer-events-none absolute inset-0 ${theme.panelAccent}`} />
      <div className="relative">{children}</div>
    </section>
  );
}
