import NotificationCard from "./NotificationCard";
import NotificationSection from "./NotificationSection";
import RegistrantNotificationItem from "./RegistrantNotificationItem";
import ContactRequestNotificationItem from "./ContactRequestNotificationItem";
import MaintenanceNotificationItem from "./MaintenanceNotificationItem";

function CountBadge({ label, value, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const badgeClassName = isDarkMode
    ? "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#f8edf0]"
    : "inline-flex items-center gap-2 rounded-full border border-[#7b0d15]/10 bg-white/80 px-4 py-2 text-sm text-[#5a0b12]";
  const valueClassName = isDarkMode
    ? "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#f8d24e]/12 px-2 text-xs font-semibold text-[#ffe28a]"
    : "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#7b0d15]/8 px-2 text-xs font-semibold text-[#7b0d15]";

  return (
    <span className={badgeClassName}>
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </span>
  );
}

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

export default function NotificationsListCard({ loadingRegistrants = false, registrants = [], contactRequests = [], maintenanceNotifications = [], fetchError = "", onApproveRegistrant, onRejectRegistrant, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const headerClassName = `flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-start lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const titleClassName = isDarkMode
    ? "text-2xl font-semibold text-[#f8edf0]"
    : "text-2xl font-semibold text-[#5a0b12]";
  const descriptionClassName = isDarkMode
    ? "max-w-3xl text-sm leading-6 text-[#bfaeb4]"
    : "max-w-3xl text-sm leading-6 text-[#8f6f76]";
  const alertClassName = isDarkMode
    ? "rounded-[1.35rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
    : "rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700";

  return (
    <NotificationCard colorMode={colorMode}>
      <div className={headerClassName}>
        <div className="space-y-2">
          <h2 className={titleClassName}>Notification inbox</h2>
          <p className={descriptionClassName}>
            Review account approvals, contact requests, and system maintenance
            updates from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <CountBadge
            label="New registrants"
            value={registrants.length}
            colorMode={colorMode}
          />
          <CountBadge
            label="Contact requests"
            value={contactRequests.length}
            colorMode={colorMode}
          />
          <CountBadge
            label="Maintenance"
            value={maintenanceNotifications.length}
            colorMode={colorMode}
          />
        </div>
      </div>

      {fetchError ? <div className={alertClassName}>{fetchError}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <NotificationSection
            title="New Registrants"
            description="Approve or reject new users before they gain access."
            count={registrants.length}
            emptyMessage="No new registrants are waiting for review."
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
            title="Superadmin Requests"
            description="Messages submitted from the Contact Us panel."
            count={contactRequests.length}
            emptyMessage="No contact requests have been submitted yet."
            hasItems={contactRequests.length > 0}
            colorMode={colorMode}
          >
            {contactRequests.map((request) => (
              <ContactRequestNotificationItem
                key={request.id}
                request={request}
                colorMode={colorMode}
              />
            ))}
          </NotificationSection>
        </div>

        <div className="min-w-0">
          <NotificationSection
            title="Maintenance Notifications"
            description="Frontend maintenance reminders for the identity platform."
            count={maintenanceNotifications.length}
            emptyMessage="There are no maintenance notices right now."
            hasItems={maintenanceNotifications.length > 0}
            colorMode={colorMode}
          >
            {maintenanceNotifications.map((notice) => (
              <MaintenanceNotificationItem
                key={notice.id}
                notice={notice}
                colorMode={colorMode}
              />
            ))}
          </NotificationSection>
        </div>
      </div>
    </NotificationCard>
  );
}