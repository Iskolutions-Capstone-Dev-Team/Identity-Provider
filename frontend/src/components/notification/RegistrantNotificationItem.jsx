import NotificationListItem from "./NotificationListItem";
import { formatTimestamp } from "../../utils/formatTimestamp";

function getFullName(user) {
  const fullName = [user?.givenName, user?.middleName, user?.surname, user?.suffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.displayName || user?.email || "New registrant";
}

function getInitials(label) {
  const words = String(label)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "NR";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function RegistrantNotificationItem({ user, onApprove, onReject, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const fullName = getFullName(user);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const leadingClassName = isDarkMode
    ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f8d24e]/25 bg-[#f8d24e]/10 text-sm font-semibold text-[#ffe28a]"
    : "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-[#7b0d15]/6 text-sm font-semibold text-[#7b0d15]";
  const statusBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-200"
    : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700";
  const roleBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-[#d7c2c8]"
    : "inline-flex rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#7b0d15]";
  const approveButtonClassName = isDarkMode
    ? "btn h-11 rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-4 text-emerald-200 shadow-none transition hover:border-emerald-300 hover:bg-emerald-400/18"
    : "btn h-11 rounded-2xl border border-emerald-600/15 bg-emerald-50 px-4 text-emerald-700 shadow-none transition hover:border-emerald-400 hover:bg-emerald-100";
  const rejectButtonClassName = isDarkMode
    ? "btn h-11 rounded-2xl border border-rose-400/30 bg-rose-400/12 px-4 text-rose-200 shadow-none transition hover:border-rose-300 hover:bg-rose-400/18"
    : "btn h-11 rounded-2xl border border-rose-600/15 bg-rose-50 px-4 text-rose-700 shadow-none transition hover:border-rose-400 hover:bg-rose-100";

  return (
    <NotificationListItem
      title={fullName}
      subtitle={user?.email || "No email available"}
      meta={
        user?.createdAt
          ? `Registered ${formatTimestamp(user.createdAt)}`
          : "Awaiting review"
      }
      description="This registrant is waiting for a superadmin decision before account access is granted."
      leading={<div className={leadingClassName}>{getInitials(fullName)}</div>}
      actions={
        <>
          <button type="button" className={rejectButtonClassName} onClick={() => onReject?.(user)}>
            Reject
          </button>
          <button type="button" className={approveButtonClassName} onClick={() => onApprove?.(user)}>
            Approve
          </button>
        </>
      }
      colorMode={colorMode}
    >
      <div className="flex flex-wrap gap-2">
        <span className={statusBadgeClassName}>Pending review</span>
        {(roles.length > 0 ? roles : ["No role assigned"]).map((role) => (
          <span key={role} className={roleBadgeClassName}>
            {role}
          </span>
        ))}
      </div>
    </NotificationListItem>
  );
}