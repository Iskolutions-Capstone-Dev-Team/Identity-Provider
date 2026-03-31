import NotificationListItem from "./NotificationListItem";
import { formatTimestamp } from "../../utils/formatTimestamp";

function getStatusBadgeClassName(status, isDarkMode) {
  if (status === "Action required") {
    return isDarkMode
      ? "inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-200"
      : "inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700";
  }

  if (status === "In progress") {
    return isDarkMode
      ? "inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-200"
      : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700";
  }

  return isDarkMode
    ? "inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200"
    : "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700";
}

export default function MaintenanceNotificationItem({ notice, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const leadingClassName = isDarkMode
    ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#ffe28a]"
    : "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-[#7b0d15]/6 text-[#7b0d15]";
  const impactBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-[#d7c2c8]"
    : "inline-flex rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#7b0d15]";

  return (
    <NotificationListItem
      title={notice?.title || "Maintenance update"}
      subtitle={notice?.system || "Identity services"}
      meta={
        notice?.scheduledFor
          ? `Window ${formatTimestamp(notice.scheduledFor)}`
          : notice?.windowLabel
      }
      description={notice?.description || "No details available."}
      leading={
        <div className={leadingClassName}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 2.185a1.125 1.125 0 0 1 1.16 0l1.854 1.054a1.125 1.125 0 0 0 .892.09l2.059-.628a1.125 1.125 0 0 1 1.005.207l1.604 1.428c.3.267.43.676.341 1.067l-.455 2.026a1.125 1.125 0 0 0 .234.979l1.374 1.566c.264.301.334.722.182 1.091l-.8 1.947a1.125 1.125 0 0 0 0 .855l.8 1.947c.152.37.082.79-.182 1.09l-1.374 1.567a1.125 1.125 0 0 0-.234.979l.455 2.026a1.125 1.125 0 0 1-.341 1.067l-1.604 1.428a1.125 1.125 0 0 1-1.005.207l-2.059-.628a1.125 1.125 0 0 0-.892.09l-1.854 1.054a1.125 1.125 0 0 1-1.16 0l-1.854-1.054a1.125 1.125 0 0 0-.892-.09l-2.059.628a1.125 1.125 0 0 1-1.005-.207L2.97 19.79a1.125 1.125 0 0 1-.341-1.067l.455-2.026a1.125 1.125 0 0 0-.234-.979L1.476 14.15a1.125 1.125 0 0 1-.182-1.09l.8-1.947a1.125 1.125 0 0 0 0-.855l-.8-1.947a1.125 1.125 0 0 1 .182-1.09L2.85 5.654a1.125 1.125 0 0 0 .234-.979l-.455-2.026a1.125 1.125 0 0 1 .341-1.067L4.574.154a1.125 1.125 0 0 1 1.005-.207l2.059.628a1.125 1.125 0 0 0 .892-.09L11.42 2.185ZM12 8.25v4.5m0 3h.008v.008H12v-.008Z"/>
          </svg>
        </div>
      }
      colorMode={colorMode}
    >
      <div className="flex flex-wrap gap-2">
        <span className={getStatusBadgeClassName(notice?.statusLabel, isDarkMode)}>
          {notice?.statusLabel || "Scheduled"}
        </span>
        {notice?.impact ? (
          <span className={impactBadgeClassName}>{notice.impact}</span>
        ) : null}
      </div>
    </NotificationListItem>
  );
}