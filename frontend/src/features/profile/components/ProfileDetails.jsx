function DetailField({ id, label, value, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  const isMissingValue = !normalizedValue;
  const displayValue = normalizedValue || "";
  const wrapperClassName = isDarkMode
    ? "group relative overflow-hidden transform-gpu rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:-translate-y-[3px] hover:border-white/16 hover:shadow-[0_28px_55px_-36px_rgba(2,6,23,0.82)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6 transition-all ease-in-out"
    : "group relative overflow-hidden transform-gpu rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:-translate-y-[3px] hover:border-[#7b0d15]/18 hover:shadow-[0_28px_55px_-34px_rgba(43,3,7,0.62)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6";
  const hoverOverlayClassName = isDarkMode
    ? "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
    : "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,248,243,0.08))] opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100";
  const labelClassName = isDarkMode
    ? "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#c7adb4] transition-colors duration-500 ease-out group-hover:text-[#d9c8cd]"
    : "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b5560] transition-colors duration-500 ease-out group-hover:text-[#69474f]";
  const valueWrapClassName = isDarkMode
    ? "mt-4 border-t border-white/10 pt-4 transition-[border-color] duration-500 ease-out group-hover:border-white/16"
    : "mt-4 border-t border-[#7b0d15]/10 pt-4 transition-[border-color] duration-500 ease-out group-hover:border-[#7b0d15]/14";
  const valueClassName = isDarkMode
    ? `text-[1.45rem] font-semibold leading-tight tracking-[0.01em] transition-colors duration-500 ease-out sm:text-[1.65rem] ${
        isMissingValue ? "text-[#c7adb4]" : "text-[#f4eaea]"
      }`
    : `text-[1.45rem] font-semibold leading-tight tracking-[0.01em] transition-colors duration-500 ease-out sm:text-[1.65rem] ${
        isMissingValue ? "text-[#8a6971]" : "text-[#351018]"
      }`;

  return (
    <div className={wrapperClassName}>
      <div className={hoverOverlayClassName} />
      <div className="relative z-10">
        <p className={labelClassName}>
          <span className="h-2 w-2 rounded-full bg-[#f8d24e]" />
          {label}
        </p>
        <div className={valueWrapClassName}>
          <p id={id} className={`${valueClassName} min-h-[2.5rem] break-words`}>
            {displayValue}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfileDetails({ profile, colorMode = "light" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DetailField
        id="firstName"
        label="First Name"
        value={profile.firstName}
        colorMode={colorMode}
      />
      <DetailField
        id="lastName"
        label="Last Name"
        value={profile.lastName}
        colorMode={colorMode}
      />
      <DetailField
        id="middleName"
        label="Middle Name"
        value={profile.middleName}
        colorMode={colorMode}
      />
      <DetailField
        id="suffix"
        label="Suffix"
        value={profile.suffix}
        colorMode={colorMode}
      />
    </div>
  );
}