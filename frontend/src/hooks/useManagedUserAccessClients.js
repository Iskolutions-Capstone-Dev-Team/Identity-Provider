import { useEffect, useState } from "react";
import { userService } from "../services/userService";

function mapManagedClient(client = {}) {
  const id = client?.id ?? client?.client_id ?? client?.clientId ?? "";
  const name = client?.name ?? client?.client_name ?? client?.clientName ?? "";

  return {
    id,
    name: typeof name === "string" ? name.trim() : "",
  };
}

export function useManagedUserAccessClients() {
  const [appClients, setAppClients] = useState([]);
  const [isLoadingAppClients, setIsLoadingAppClients] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchManagedClients = async () => {
      try {
        setIsLoadingAppClients(true);

        const managedClients = await userService.getManagedUserAccessClients();
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
  }, []);

  return {
    appClients,
    isLoadingAppClients,
  };
}