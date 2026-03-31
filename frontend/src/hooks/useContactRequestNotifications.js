import { useEffect, useState } from "react";
import {
  CONTACT_REQUEST_NOTIFICATIONS_EVENT,
  CONTACT_REQUEST_NOTIFICATIONS_KEY,
  readContactRequestNotifications,
} from "../utils/contactRequestNotifications";

export function useContactRequestNotifications() {
  const [contactRequests, setContactRequests] = useState(() =>
    readContactRequestNotifications(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncContactRequests = () => {
      setContactRequests(readContactRequestNotifications());
    };

    const handleStorage = (event) => {
      if (event?.key && event.key !== CONTACT_REQUEST_NOTIFICATIONS_KEY) {
        return;
      }

      syncContactRequests();
    };

    syncContactRequests();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      CONTACT_REQUEST_NOTIFICATIONS_EVENT,
      syncContactRequests,
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        CONTACT_REQUEST_NOTIFICATIONS_EVENT,
        syncContactRequests,
      );
    };
  }, []);

  return contactRequests;
}