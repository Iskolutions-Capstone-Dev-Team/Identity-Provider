import { useEffect, useState } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 50;
let allAppClientsRequest = null;

const normalizeRoleNames = (roles = []) =>
  Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => role?.role_name ?? role?.roleName ?? role?.name ?? "")
        .map((roleName) =>
          typeof roleName === "string" ? roleName.trim() : "",
        )
        .filter(Boolean),
    ),
  );

const mapClientSummary = (client = {}) => {
  const clientId = client.id ?? client.client_id ?? client.clientId ?? "";

  return {
    id: clientId,
    name: client.name ?? client.client_name ?? client.clientName ?? "",
    roleNames: normalizeRoleNames(
      client.allowed_roles ?? client.allowedRoles ?? client.roles,
    ),
  };
};

async function getAllAppClientOptions() {
  const firstPage = await clientService.getClients({
    limit: ITEMS_PER_PAGE,
    page: 1,
  });
  const collectedClients = Array.isArray(firstPage?.items)
    ? [...firstPage.items]
    : [];
  const lastPage =
    Number.isInteger(firstPage?.lastPage) && firstPage.lastPage > 1
      ? firstPage.lastPage
      : 1;

  if (lastPage > 1) {
    const pageRequests = [];

    for (let page = 2; page <= lastPage; page += 1) {
      pageRequests.push(
        clientService.getClients({
          limit: ITEMS_PER_PAGE,
          page,
        }),
      );
    }

    const pageResults = await Promise.all(pageRequests);
    pageResults.forEach((pagePayload) => {
      if (Array.isArray(pagePayload?.items)) {
        collectedClients.push(...pagePayload.items);
      }
    });
  }

  const clientMap = new Map();
  collectedClients.forEach((client) => {
    const normalizedClient = mapClientSummary(client);

    if (!normalizedClient.id || !normalizedClient.name) {
      return;
    }

    clientMap.set(normalizedClient.id, normalizedClient);
  });

  return Array.from(clientMap.values()).sort((firstClient, secondClient) =>
    firstClient.name.localeCompare(secondClient.name),
  );
}

function loadAllAppClientOptions() {
  if (allAppClientsRequest) {
    return allAppClientsRequest;
  }

  allAppClientsRequest = getAllAppClientOptions().finally(() => {
    allAppClientsRequest = null;
  });

  return allAppClientsRequest;
}

export function useAllAppClients({ enabled = true } = {}) {
  const [appClients, setAppClients] = useState([]);
  const [isLoadingAppClients, setIsLoadingAppClients] = useState(enabled);
  const [appClientsError, setAppClientsError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setAppClients([]);
      setAppClientsError("");
      setIsLoadingAppClients(false);
      return undefined;
    }

    let cancelled = false;

    const fetchAllAppClients = async () => {
      try {
        setIsLoadingAppClients(true);
        setAppClientsError("");

        const nextAppClients = await loadAllAppClientOptions();

        if (!cancelled) {
          setAppClients(nextAppClients);
        }
      } catch (error) {
        console.error("Failed to fetch app clients:", error);

        if (!cancelled) {
          setAppClients([]);
          setAppClientsError(
            "Failed to load app clients. Check the backend connection.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAppClients(false);
        }
      }
    };

    fetchAllAppClients();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    appClients,
    appClientsError,
    isLoadingAppClients,
  };
}