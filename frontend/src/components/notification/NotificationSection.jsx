export default function NotificationSection({ title, description, icon, count = 0, showCount = true, emptyMessage, hasItems = true, colorMode = "light", children }) {
  const isDarkMode = colorMode === "dark";
  const sectionClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(28,18,29,0.82))] shadow-[0_22px_55px_-40px_rgba(2,6,23,0.82)]"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/70 shadow-[0_22px_55px_-40px_rgba(43,3,7,0.3)]";
  const headerClassName = isDarkMode
    ? "border-b border-white/10 bg-white/[0.03]"
    : "border-b border-[#7b0d15]/10 bg-[#fffaf5]/80";
  const titleClassName = isDarkMode
    ? "text-lg font-semibold text-[#f8edf0]"
    : "text-lg font-semibold text-[#5a0b12]";
  const iconBadgeClassName = isDarkMode
    ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#ffe28a]"
    : "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-[#fff7eb] text-[#9b6a12]";
  const descriptionClassName = isDarkMode
    ? "text-sm leading-6 text-[#bfaeb4]"
    : "text-sm leading-6 text-[#8f6f76]";
  const countClassName = isDarkMode
    ? "inline-flex min-w-10 items-center justify-center rounded-full border border-[#f8d24e]/20 bg-[#f8d24e]/12 px-3 py-1 text-sm font-semibold text-[#ffe28a]"
    : "inline-flex min-w-10 items-center justify-center rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-sm font-semibold text-[#7b0d15]";
  const emptyStateClassName = isDarkMode
    ? "px-5 py-8 text-sm leading-6 text-[#bfaeb4]"
    : "px-5 py-8 text-sm leading-6 text-[#8f6f76]";
  const listClassName = isDarkMode
    ? "divide-y divide-white/10"
    : "divide-y divide-[#7b0d15]/10";

  return (
    <section className={sectionClassName}>
      <div className={`flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {icon ? <span className={iconBadgeClassName}>{icon}</span> : null}
            <h2 className={titleClassName}>{title}</h2>
          </div>
          {description ? (
            <p className={descriptionClassName}>{description}</p>
          ) : null}
        </div>
        {showCount ? <span className={countClassName}>{count}</span> : null}
      </div>

      {hasItems ? (
        <ul className={listClassName}>{children}</ul>
      ) : (
        <div className={emptyStateClassName}>{emptyMessage}</div>
      )}
    </section>
  );
}