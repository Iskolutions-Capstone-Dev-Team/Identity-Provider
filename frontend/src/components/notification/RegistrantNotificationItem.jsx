import NotificationListItem from "./NotificationListItem";
import { formatTimestamp } from "../../utils/formatTimestamp";

function getFullName(user) {
  const fullName = [user?.givenName, user?.middleName, user?.surname, user?.suffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.displayName || user?.email || "New registrant";
}

function formatDateOnly(isoString) {
  if (!isoString) {
    return "";
  }

  return formatTimestamp(isoString).slice(0, 10);
}

function getPrimaryRegistrantRole(userRoles = []) {
  const allowedRoles = ["Applicant", "Student", "Guest"];
  const normalizedRoles = userRoles
    .map((role) => String(role || "").trim())
    .filter(Boolean);
  const matchedRole = allowedRoles.find((role) =>
    normalizedRoles.some(
      (userRole) => userRole.toLowerCase() === role.toLowerCase(),
    ),
  );

  return matchedRole || normalizedRoles[0] || "Applicant";
}

function RegistrantActionButton({ label, onClick, disabled = false, colorMode = "light", variant = "primary", children }) {
  const isDarkMode = colorMode === "dark";
  const buttonClassName = variant === "danger"
    ? isDarkMode
      ? "btn h-11 w-11 rounded-2xl border border-rose-400/30 bg-rose-400/12 px-0 text-rose-200 shadow-none transition hover:border-rose-300 hover:bg-rose-400/18 disabled:border-rose-400/15 disabled:bg-rose-400/7 disabled:text-rose-300/55 disabled:opacity-100"
      : "btn h-11 w-11 rounded-2xl border border-rose-600/15 bg-rose-50 px-0 text-rose-700 shadow-none transition hover:border-rose-400 hover:bg-rose-100 disabled:border-rose-200 disabled:bg-rose-50/80 disabled:text-rose-400 disabled:opacity-100"
    : isDarkMode
      ? "btn h-11 w-11 rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-0 text-emerald-200 shadow-none transition hover:border-emerald-300 hover:bg-emerald-400/18 disabled:border-emerald-400/15 disabled:bg-emerald-400/7 disabled:text-emerald-300/55 disabled:opacity-100"
      : "btn h-11 w-11 rounded-2xl border border-emerald-600/15 bg-emerald-50 px-0 text-emerald-700 shadow-none transition hover:border-emerald-400 hover:bg-emerald-100 disabled:border-emerald-200 disabled:bg-emerald-50/80 disabled:text-emerald-400 disabled:opacity-100";
  const tooltipClassName = isDarkMode
    ? "border border-white/10 bg-[linear-gradient(135deg,rgba(17,24,39,0.98),rgba(31,19,27,0.96))] text-[#f4eaea] shadow-[0_20px_42px_-24px_rgba(2,6,23,0.88)]"
    : "border border-[#7b0d15]/12 bg-[linear-gradient(135deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] text-[#5a0b12] shadow-[0_20px_42px_-24px_rgba(43,3,7,0.42)]";
  const tooltipArrowClassName = isDarkMode
    ? "border-r border-t border-white/10 bg-[rgb(25,22,31)]"
    : "border-r border-t border-[#7b0d15]/12 bg-[rgb(255,251,246)]";

  return (
    <div className="group relative flex">
      {!disabled ? (
        <div className="pointer-events-none absolute bottom-[calc(100%+0.8rem)] left-1/2 z-[1] flex -translate-x-1/2 flex-col items-center gap-1 opacity-0 invisible translate-y-1 transition-[opacity,transform,visibility] duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <span className={`whitespace-nowrap rounded-2xl px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] backdrop-blur-xl ${tooltipClassName}`}>
            {label}
          </span>
          <span aria-hidden="true" className={`h-3 w-3 rotate-45 rounded-[0.2rem] ${tooltipArrowClassName}`} />
        </div>
      ) : null}

      <button type="button" className={buttonClassName} onClick={onClick} aria-label={label} disabled={disabled}>
        {children}
      </button>
    </div>
  );
}

export default function RegistrantNotificationItem({ user, onApprove, onReject, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const fullName = getFullName(user);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const currentStatus = user?.workflowStatus || "pending";
  const statusBadgeClassName = currentStatus === "created"
    ? isDarkMode
      ? "inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200"
      : "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700"
    : currentStatus === "declined"
      ? isDarkMode
        ? "inline-flex rounded-full border border-rose-400/25 bg-rose-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-200"
        : "inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700"
      : isDarkMode
        ? "inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-200"
        : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700";
  const roleBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-[#d7c2c8]"
    : "inline-flex rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#7b0d15]";
  const metaBadgeClassName = isDarkMode
    ? "inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#bfaeb4]"
    : "inline-flex items-center rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#8f6f76]";
  const dateLabel = formatDateOnly(user?.createdAt);
  const primaryRole = getPrimaryRegistrantRole(roles);
  const isActionLocked = currentStatus !== "pending";
  const statusLabel = currentStatus === "created"
    ? "Created"
    : currentStatus === "declined"
      ? "Declined"
      : "Pending review";

  return (
    <NotificationListItem
      title={fullName}
      subtitle={user?.email || "No email available"}
      truncateTitle={false}
      truncateSubtitle={false}
      actions={
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex gap-2">
            <RegistrantActionButton
              label="Reject"
              onClick={() => onReject?.(user)}
              disabled={isActionLocked}
              colorMode={colorMode}
              variant="danger"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </RegistrantActionButton>
            <RegistrantActionButton
              label="Accept"
              onClick={() => onApprove?.(user)}
              disabled={isActionLocked}
              colorMode={colorMode}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
            </RegistrantActionButton>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {dateLabel ? <span className={metaBadgeClassName}>{dateLabel}</span> : null}
            <span className={statusBadgeClassName}>{statusLabel}</span>
            <span className={roleBadgeClassName}>{primaryRole}</span>
          </div>
        </div>
      }
      colorMode={colorMode}
    />
  );
}