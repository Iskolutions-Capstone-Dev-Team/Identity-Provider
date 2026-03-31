function SummaryMetric({ title, value, description, icon, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const tileClassName = isDarkMode
    ? "group rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.92)] transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-white/15 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] hover:shadow-[0_28px_65px_-40px_rgba(2,6,23,0.98)] transition-all"
    : "group rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/75 px-5 py-5 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.28)] transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-[#7b0d15]/15 hover:bg-white/90 hover:shadow-[0_28px_65px_-40px_rgba(43,3,7,0.34)] transition-all";
  const iconBadgeClassName = isDarkMode
    ? "inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#ffe28a] transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-3"
    : "inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-[#fff7eb] text-[#9b6a12] transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-3";
  const titleClassName = isDarkMode
    ? "text-base font-medium text-[#d7c6cd]"
    : "text-base font-medium text-[#8f6f76]";
  const valueClassName = isDarkMode
    ? "text-4xl font-semibold tracking-[-0.02em] text-[#f8edf0]"
    : "text-4xl font-semibold tracking-[-0.02em] text-[#5a0b12]";
  const descriptionClassName = isDarkMode
    ? "text-base leading-7 text-[#bfaeb4]"
    : "text-base leading-7 text-[#8f6f76]";

  return (
    <div className={tileClassName}>
      <div className="flex items-start justify-between gap-4">
        <p className={titleClassName}>{title}</p>
        <span className={iconBadgeClassName}>{icon}</span>
      </div>
      <p className={`mt-3 ${valueClassName}`}>{value}</p>
      <p className={`mt-2 ${descriptionClassName}`}>{description}</p>
    </div>
  );
}

export default function NotificationsSummaryCard({ registrantsCount = 0, contactRequestsCount = 0, colorMode = "light" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SummaryMetric
        title="User registrants"
        value={registrantsCount}
        description="Accounts waiting for approval."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
        }
        colorMode={colorMode}
      />
      <SummaryMetric
        title="Request"
        value={contactRequestsCount}
        description="Submitted requests awaiting review."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6.905 9.97a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72V18a.75.75 0 0 0 1.5 0v-4.19l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
            <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
          </svg>
        }
        colorMode={colorMode}
      />
    </div>
  );
}