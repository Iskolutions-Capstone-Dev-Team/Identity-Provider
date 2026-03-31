import NotificationCard from "./NotificationCard";
import NotificationSection from "./NotificationSection";
import RegistrantNotificationItem from "./RegistrantNotificationItem";
import ContactRequestNotificationItem from "./ContactRequestNotificationItem";

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

function RequestLoadingRow({ colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const pulseBlockClassName = isDarkMode
    ? "animate-pulse rounded-2xl bg-white/8"
    : "animate-pulse rounded-2xl bg-[#7b0d15]/7";

  return (
    <li className="px-5 py-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className={`h-4 w-52 ${pulseBlockClassName}`} />
          <div className={`h-7 w-28 ${pulseBlockClassName}`} />
        </div>
        <div className="space-y-2">
          <div className={`h-3 w-full ${pulseBlockClassName}`} />
          <div className={`h-3 w-5/6 ${pulseBlockClassName}`} />
        </div>
      </div>
    </li>
  );
}

export default function NotificationsListCard({ loadingRegistrants = false, registrants = [], contactRequests = [], fetchError = "", onApproveRegistrant, onRejectRegistrant, colorMode = "light" }) {
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

      <div className="grid gap-5 lg:grid-cols-2">
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

        <NotificationSection
          title="Requests"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6.905 9.97a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72V18a.75.75 0 0 0 1.5 0v-4.19l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
              <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
            </svg>
          }
          count={contactRequests.length}
          showCount={false}
          emptyMessage="No requests have been submitted yet."
          hasItems={loadingRegistrants || contactRequests.length > 0}
          colorMode={colorMode}
        >
          {loadingRegistrants
            ? Array.from({ length: 3 }, (_, index) => (
                <RequestLoadingRow
                  key={`request-loading-${index}`}
                  colorMode={colorMode}
                />
              ))
            : contactRequests.map((request) => (
                <ContactRequestNotificationItem
                  key={request.id}
                  request={request}
                  onMarkRead={request.onMarkRead}
                  colorMode={colorMode}
                />
              ))}
        </NotificationSection>
      </div>
    </NotificationCard>
  );
}