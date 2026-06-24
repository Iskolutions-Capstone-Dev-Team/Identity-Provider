export default function EmailStatus({ colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const cardClassName = isDarkMode
    ? "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const iconWrapClassName = isDarkMode
    ? "flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#f8d24e]/12 text-[#ffe28a] transition-[background-color,color] duration-500 ease-out"
    : "flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#eef5ff] text-[#2d5b95] transition-[background-color,color] duration-500 ease-out";
  const titleClassName = isDarkMode
    ? "text-base font-semibold text-[#f6eaec] transition-colors duration-500 ease-out"
    : "text-base font-semibold text-[#351018] transition-colors duration-500 ease-out";
  const descriptionClassName = isDarkMode
    ? "text-sm text-[#c7adb4] transition-colors duration-500 ease-out"
    : "text-sm text-[#8a6971] transition-colors duration-500 ease-out";
  const statusBadgeClassName = isDarkMode
    ? "inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition-[background-color,border-color,color] duration-500 ease-out"
    : "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-[background-color,border-color,color] duration-500 ease-out";
  const statusDotClassName = isDarkMode
    ? "h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse"
    : "h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse";

  return (
    <div className={cardClassName}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className={iconWrapClassName}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/>
            </svg>
          </div>

          <div>
            <h4 className={titleClassName}>Email Status</h4>
            <p className={descriptionClassName}>Current email delivery status</p>
          </div>
        </div>

        <div className={statusBadgeClassName}>
          <span className={statusDotClassName} />
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round"  strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            Email Active
          </span>
        </div>
      </div>
    </div>
  );
}