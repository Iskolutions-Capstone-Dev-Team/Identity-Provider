import { useEffect, useState } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 50;

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
    name: client.name ?? "",
    roleNames: normalizeRoleNames(
      client.allowed_roles ?? client.allowedRoles ?? client.roles,
    ),
  };
};

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

        const uniqueClientIds = Array.from(
          new Set(
            collectedClients
              .map((client) => client?.id ?? client?.client_id ?? client?.clientId ?? "")
              .filter(Boolean),
          ),
        );
        const detailedClients = await Promise.all(
          uniqueClientIds.map(async (clientId) => {
            try {
              const clientDetail = await clientService.getClientById(clientId);
              return mapClientSummary(clientDetail?.client ?? clientDetail);
            } catch (error) {
              console.error(`Failed to fetch app client details for ${clientId}:`, error);
              const matchedClient = collectedClients.find((client) => {
                const currentClientId =
                  client?.id ?? client?.client_id ?? client?.clientId ?? "";

                return currentClientId === clientId;
              });

              return mapClientSummary(matchedClient);
            }
          }),
        );
        const clientMap = new Map();
        detailedClients.forEach((client) => {
          if (!client?.id) {
            return;
          }

          clientMap.set(client.id, client);
        });

        if (!cancelled) {
          setAppClients(
            Array.from(clientMap.values()).sort((firstClient, secondClient) =>
              firstClient.name.localeCompare(secondClient.name),
            ),
          );
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