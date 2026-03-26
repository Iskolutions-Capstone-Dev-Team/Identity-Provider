function DetailField({ id, label, value, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = isDarkMode
    ? "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const labelClassName = isDarkMode
    ? "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#c7adb4] transition-colors duration-500 ease-out"
    : "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b5560] transition-colors duration-500 ease-out";
  const valueWrapClassName = isDarkMode
    ? "rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.78),rgba(22,28,40,0.88))] px-4 py-3 text-base font-medium text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,243,0.94))] px-4 py-3 text-base font-medium text-[#351018] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-[background-color,border-color,color] duration-500 ease-out";

  return (
    <div className={wrapperClassName}>
      <label className={labelClassName}>
        <span className="h-2 w-2 rounded-full bg-[#f8d24e]" />
        {label}
      </label>
      <div className={valueWrapClassName}>
        <span id={id} className="block min-h-6 break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

function AuditField({ id, label, value, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = isDarkMode
    ? "rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.94),rgba(32,22,30,0.9))] p-4 shadow-[0_20px_44px_-38px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.92))] p-4 shadow-[0_20px_44px_-38px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const labelClassName = isDarkMode
    ? "text-xs font-semibold uppercase tracking-[0.08em] text-[#c7adb4] transition-colors duration-500 ease-out"
    : "text-xs font-semibold uppercase tracking-[0.08em] text-[#8a6971] transition-colors duration-500 ease-out";
  const valueClassName = isDarkMode
    ? "mt-2 text-base font-semibold text-[#f4eaea] transition-colors duration-500 ease-out"
    : "mt-2 text-base font-semibold text-[#351018] transition-colors duration-500 ease-out";

  return (
    <div className={wrapperClassName}>
      <p className={labelClassName}>{label}</p>
      <p id={id} className={valueClassName}>
        {value}
      </p>
    </div>
  );
}

export default function ProfileDetails({ profile, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const auditCardClassName = isDarkMode
    ? "rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_50px_-40px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/72 p-5 shadow-[0_24px_50px_-40px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const auditIconClassName = isDarkMode
    ? "flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#f8d24e]/12 text-[#ffe28a] transition-[background-color,color] duration-500 ease-out"
    : "flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff4dc] text-[#7b0d15] transition-[background-color,color] duration-500 ease-out";
  const auditTitleClassName = isDarkMode
    ? "text-lg font-semibold text-[#f6eaec] transition-colors duration-500 ease-out"
    : "text-lg font-semibold text-[#351018] transition-colors duration-500 ease-out";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-3">
        <DetailField
          id="firstName"
          label="First Name"
          value={profile.firstName}
          colorMode={colorMode}
        />
        <DetailField
          id="middleName"
          label="Middle Name"
          value={profile.middleName}
          colorMode={colorMode}
        />
        <DetailField
          id="lastName"
          label="Last Name"
          value={profile.lastName}
          colorMode={colorMode}
        />
      </div>

      <div className={auditCardClassName}>
        <div className="mb-5 flex items-center gap-3">
          <div className={auditIconClassName}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"/>
            </svg>
          </div>
          <h3 className={auditTitleClassName}>Audit Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AuditField
            id="createdAt"
            label="Created At"
            value="2023-08-15 10:30:45"
            colorMode={colorMode}
          />
          <AuditField
            id="updatedAt"
            label="Updated At"
            value="2024-01-20 14:25:10"
            colorMode={colorMode}
          />
        </div>
      </div>
    </div>
  );
}