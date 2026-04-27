import { useEffect, useRef, useState } from "react";
import { userService } from "../services/userService";

let managedUserAccessClientsRequest = null;

function mapManagedClient(client = {}) {
  const id = client?.id ?? client?.client_id ?? client?.clientId ?? "";
  const name = client?.name ?? client?.client_name ?? client?.clientName ?? "";

  return {
    id,
    name: typeof name === "string" ? name.trim() : "",
  };
}

function loadManagedUserAccessClients() {
  if (managedUserAccessClientsRequest) {
    return managedUserAccessClientsRequest;
  }

  managedUserAccessClientsRequest =
    userService.getManagedUserAccessClients().finally(() => {
      managedUserAccessClientsRequest = null;
    });

  return managedUserAccessClientsRequest;
}

export function useManagedUserAccessClients({ enabled = true } = {}) {
  const [appClients, setAppClients] = useState([]);
  const [isLoadingAppClients, setIsLoadingAppClients] = useState(enabled);
  const [refreshKey, setRefreshKey] = useState(0);
  const skipNextLoadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setAppClients([]);
      setIsLoadingAppClients(false);
      return undefined;
    }

    let cancelled = false;
    const shouldShowLoading = !skipNextLoadingRef.current;
    skipNextLoadingRef.current = false;

    const fetchManagedClients = async () => {
      try {
        if (shouldShowLoading) {
          setIsLoadingAppClients(true);
        }

        const managedClients = await loadManagedUserAccessClients();
        const clientMap = new Map();

        managedClients.forEach((client) => {
          const normalizedClient = mapManagedClient(client);

          if (!normalizedClient.id || !normalizedClient.name) {
            return;
          }

          clientMap.set(normalizedClient.id, normalizedClient);
        });

        if (!cancelled) {
          setAppClients(
            Array.from(clientMap.values()).sort((firstClient, secondClient) =>
              firstClient.name.localeCompare(secondClient.name),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch managed user access clients:", error);

        if (!cancelled) {
          setAppClients([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAppClients(false);
        }
      }
    };

    fetchManagedClients();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshKey]);

  const refreshAppClients = ({ showLoading = true } = {}) => {
    if (!enabled) {
      setAppClients([]);
      setIsLoadingAppClients(false);
      return;
    }

    if (!showLoading) {
      skipNextLoadingRef.current = true;
    }

    setRefreshKey((currentValue) => currentValue + 1);
  };

  return {
    appClients,
    isLoadingAppClients,
    refreshAppClients,
  };
}