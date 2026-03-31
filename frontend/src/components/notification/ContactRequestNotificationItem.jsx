import NotificationListItem from "./NotificationListItem";
import { formatTimestamp } from "../../utils/formatTimestamp";

export default function ContactRequestNotificationItem({ request, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const leadingClassName = isDarkMode
    ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
    : "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-[#7b0d15]/6 text-[#7b0d15]";
  const requestBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-200"
    : "inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-700";

  return (
    <NotificationListItem
      title={request?.email || "Unknown sender"}
      subtitle="Submitted from Contact Us"
      meta={
        request?.submittedAt
          ? `Submitted ${formatTimestamp(request.submittedAt)}`
          : "Recently submitted"
      }
      description={request?.message || "No message was provided."}
      leading={
        <div className={leadingClassName}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
          </svg>
        </div>
      }
      colorMode={colorMode}
    >
      <div className="flex flex-wrap gap-2">
        <span className={requestBadgeClassName}>Superadmin request</span>
      </div>
    </NotificationListItem>
  );
}