import NotificationCard from "./NotificationCard";
import NotificationSection from "./NotificationSection";
import RegistrantNotificationItem from "./RegistrantNotificationItem";

function RegistrantLoadingRow({ colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const pulseBlockClassName = isDarkMode
    ? "animate-pulse rounded-2xl bg-white/8"
    : "animate-pulse rounded-2xl bg-[#7b0d15]/7";

  return (
    <li className="px-5 py-5">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 shrink-0 ${pulseBlockClassName}`} />
        <div className="flex-1 space-y-3">
          <div className={`h-4 w-40 ${pulseBlockClassName}`} />
          <div className={`h-3 w-56 ${pulseBlockClassName}`} />
          <div className="flex flex-wrap gap-2">
            <div className={`h-7 w-28 ${pulseBlockClassName}`} />
            <div className={`h-7 w-24 ${pulseBlockClassName}`} />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function NotificationsListCard({ loadingRegistrants = false, registrants = [], fetchError = "", onApproveRegistrant, onRejectRegistrant, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const headerClassName = `border-b pb-6 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const titleClassName = isDarkMode
    ? "text-2xl font-semibold text-[#f8edf0]"
    : "text-2xl font-semibold text-[#5a0b12]";
  const alertClassName = isDarkMode
    ? "rounded-[1.35rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
    : "rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700";

  return (
    <NotificationCard colorMode={colorMode}>
      <div className={headerClassName}>
        <h2 className={titleClassName}>Inbox</h2>
      </div>

      {fetchError ? <div className={alertClassName}>{fetchError}</div> : null}

      <div className="grid gap-5">
        <NotificationSection
          title="New Registrants"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          }
          count={registrants.length}
          showCount={false}
          emptyMessage="No new accounts are pending review."
          hasItems={loadingRegistrants || registrants.length > 0}
          colorMode={colorMode}
        >
          {loadingRegistrants
            ? Array.from({ length: 3 }, (_, index) => (
                <RegistrantLoadingRow
                  key={`registrant-loading-${index}`}
                  colorMode={colorMode}
                />
              ))
            : registrants.map((registrant) => (
                <RegistrantNotificationItem
                  key={registrant.id}
                  user={registrant}
                  onApprove={onApproveRegistrant}
                  onReject={onRejectRegistrant}
                  colorMode={colorMode}
                />
              ))}
        </NotificationSection>
      </div>
    </NotificationCard>
  );
}