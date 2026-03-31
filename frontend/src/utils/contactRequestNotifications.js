const CONTACT_REQUEST_NOTIFICATIONS_KEY = "idpContactRequestNotifications";
export const CONTACT_REQUEST_NOTIFICATIONS_EVENT =
  "idp:contact-request-notifications-updated";

function isBrowserEnvironment() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function generateNotificationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `contact-request-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 10)}`;
}

function normalizeNotificationEntry(entry) {
  const email = normalizeTextValue(entry?.email);
  const message = normalizeTextValue(entry?.message);
  const submittedAt = normalizeTextValue(entry?.submittedAt);

  if (!email || !message || !submittedAt) {
    return null;
  }

  return {
    id: normalizeTextValue(entry?.id) || generateNotificationId(),
    email,
    message,
    submittedAt,
  };
}

function sortNotificationsByNewest(notifications) {
  return [...notifications].sort((first, second) => {
    const firstDate = Date.parse(first.submittedAt);
    const secondDate = Date.parse(second.submittedAt);
    return secondDate - firstDate;
  });
}

export function readContactRequestNotifications() {
  if (!isBrowserEnvironment()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      CONTACT_REQUEST_NOTIFICATIONS_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortNotificationsByNewest(
      parsedValue
        .map(normalizeNotificationEntry)
        .filter(Boolean),
    );
  } catch (error) {
    console.error("Failed to read contact request notifications:", error);
    return [];
  }
}

export function addContactRequestNotification(notification) {
  if (!isBrowserEnvironment()) {
    return null;
  }

  const nextNotification = normalizeNotificationEntry({
    id: generateNotificationId(),
    email: notification?.email,
    message: notification?.message,
    submittedAt: new Date().toISOString(),
  });

  if (!nextNotification) {
    return null;
  }

  try {
    const currentNotifications = readContactRequestNotifications();
    const nextNotifications = [nextNotification, ...currentNotifications].slice(
      0,
      25,
    );

    window.localStorage.setItem(
      CONTACT_REQUEST_NOTIFICATIONS_KEY,
      JSON.stringify(nextNotifications),
    );
    window.dispatchEvent(
      new CustomEvent(CONTACT_REQUEST_NOTIFICATIONS_EVENT, {
        detail: nextNotifications,
      }),
    );
  } catch (error) {
    console.error("Failed to save contact request notification:", error);
  }

  return nextNotification;
}

export { CONTACT_REQUEST_NOTIFICATIONS_KEY };