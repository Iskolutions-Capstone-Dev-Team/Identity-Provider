import NotificationListItem from "./NotificationListItem";
import { formatTimestamp } from "../../utils/formatTimestamp";

function formatDateOnly(isoString) {
  if (!isoString) {
    return "";
  }

  return formatTimestamp(isoString).slice(0, 10);
}

export default function ContactRequestNotificationItem({ request, onMarkRead, colorMode = "light" }) {
  return (
    <NotificationListItem
      title={request?.email || "Unknown sender"}
      meta={
        request?.submittedAt
          ? formatDateOnly(request.submittedAt)
          : "Recently submitted"
      }
      description={request?.message || "No message was provided."}
      onClick={() => onMarkRead?.(request)}
      isMuted={Boolean(request?.isRead)}
      truncateTitle={false}
      colorMode={colorMode}
    />
  );
}