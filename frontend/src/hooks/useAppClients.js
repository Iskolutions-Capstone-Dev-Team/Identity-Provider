import { useCallback, useEffect, useState } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 10;

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

const getClientId = (client = {}) => client.id ?? client.client_id ?? client.clientId ?? "";

const sortClientsByName = (clients = []) =>
  [...clients].sort((firstClient, secondClient) =>
    (firstClient?.name ?? "").localeCompare(secondClient?.name ?? ""),
  );

const mapClientSummary = (client = {}) => {
  const clientId = getClientId(client);

  return {
    id: clientId,
    clientId,
    name: client.name ?? "",
    description: client.description ?? "",
    created: (client.created_at ?? client.createdAt ?? "").slice(0, 10) || "-",
    image:
      client.image_location ??
      client.imageLocation ??
      client.image ??
      null,
    base_url: client.base_url ?? client.baseURL ?? "",
    redirect_uri: client.redirect_uri ?? client.redirectURI ?? "",
    logout_uri: client.logout_uri ?? client.logoutURI ?? "",
    grants: Array.isArray(client.grants) ? client.grants : [],
    roleNames: normalizeRoleNames(
      client.allowed_roles ?? client.allowedRoles ?? client.roles,
    ),
  };
};

const normalizeClientDetailPayload = (payload = {}) => {
  const client =
    payload.client ??
    payload.data?.client ??
    payload.data ??
    payload;

  return mapClientSummary(client);
};

const matchesClientSearch = (client = {}, searchValue = "") => {
  const normalizedSearch =
    typeof searchValue === "string" ? searchValue.trim().toLowerCase() : "";

  if (!normalizedSearch) {
    return true;
  }

  const clientName =
    typeof client?.name === "string" ? client.name.toLowerCase() : "";
  const clientId =
    typeof client?.clientId === "string" ? client.clientId.toLowerCase() : "";

  return (
    clientName.includes(normalizedSearch) ||
    clientId.includes(normalizedSearch)
  );
};

const getMatchingClients = async (keyword) => {
  const matchedClients = [];
  let nextPage = 1;

  while (true) {
    const { items } = await clientService.getClients({
      limit: ITEMS_PER_PAGE,
      page: nextPage,
      keyword,
    });

    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    matchedClients.push(...items);

    if (items.length < ITEMS_PER_PAGE) {
      break;
    }

    nextPage += 1;
  }

  return matchedClients;
};

const getManagedClients = async (managedClients = []) => {
  const uniqueManagedClients = Array.from(
    new Map(
      (Array.isArray(managedClients) ? managedClients : [])
        .map((client) => [getClientId(client), client])
        .filter(([clientId]) => Boolean(clientId)),
    ).values(),
  );

  const detailedClients = await Promise.all(
    uniqueManagedClients.map(async (client) => {
      const clientId = getClientId(client);

      try {
        const payload = await clientService.getClientById(clientId);
        return normalizeClientDetailPayload(payload);
      } catch (error) {
        console.error(`Failed to fetch managed app client ${clientId}:`, error);
        return mapClientSummary(client);
      }
    }),
  );

  return sortClientsByName(
    detailedClients.filter((client) => Boolean(client?.id)),
  );
};

export function useAppClients({
  managedClients = null,
  isManagedClientsLoading = false,
} = {}) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [secretModal, setSecretModal] = useState({
    open: false,
    clientId: "",
    clientName: "",
    secret: "",
    title: "",
    loading: false,
    hasError: false,
  });

  const isManagedMode = Array.isArray(managedClients);
  const searchKeyword = search.trim();

  const fetchPageClients = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const { items, total, lastPage } = await clientService.getClients({
        limit: ITEMS_PER_PAGE,
        page,
      });
      const nextClients = items.map(mapClientSummary);
      const nextTotalResults =
        Number.isInteger(total) && total >= 0 ? total : nextClients.length;
      const nextTotalPages =
        Number.isInteger(lastPage) && lastPage > 0
          ? lastPage
          : Math.max(1, Math.ceil(nextTotalResults / ITEMS_PER_PAGE));

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setClients(nextClients);
      setTotalClientCount(nextTotalResults);
    } catch (error) {
      console.error("Fetch clients error:", error);
      setClients([]);
      setTotalClientCount(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [page]);

  const fetchMatchingClients = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const matchedClients = await getMatchingClients(searchKeyword);
      setClients(matchedClients.map(mapClientSummary));
      setTotalClientCount(matchedClients.length);
    } catch (error) {
      console.error("Fetch clients error:", error);
      setClients([]);
      setTotalClientCount(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [searchKeyword]);

  const fetchManagedClients = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const nextClients = await getManagedClients(managedClients);
      setClients(nextClients);
      setTotalClientCount(nextClients.length);
    } catch (error) {
      console.error("Fetch managed clients error:", error);
      setClients([]);
      setTotalClientCount(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [managedClients]);

  useEffect(() => {
    if (isManagedMode) {
      if (isManagedClientsLoading) {
        setLoading(true);
        return;
      }

      fetchManagedClients();
      return;
    }

    if (searchKeyword) {
      return;
    }

    fetchPageClients();
  }, [
    fetchManagedClients,
    fetchPageClients,
    isManagedClientsLoading,
    isManagedMode,
    searchKeyword,
  ]);

  useEffect(() => {
    if (isManagedMode || !searchKeyword) {
      return;
    }

    fetchMatchingClients();
  }, [fetchMatchingClients, isManagedMode, searchKeyword]);

  const setSearchKeyword = useCallback((value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  }, []);

  const visibleClients = isManagedMode
    ? clients.filter((client) => matchesClientSearch(client, searchKeyword))
    : clients;
  const shouldPaginateVisibleClients = isManagedMode || Boolean(searchKeyword);
  const totalResults = isManagedMode
    ? visibleClients.length
    : totalClientCount;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const paginatedClients = shouldPaginateVisibleClients
    ? visibleClients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : visibleClients;

  const refreshClients = async ({ showLoading = true } = {}) => {
    if (isManagedMode) {
      await fetchManagedClients({ showLoading });
      return;
    }

    if (searchKeyword) {
      await fetchMatchingClients({ showLoading });
      return;
    }

    await fetchPageClients({ showLoading });
  };

  const createClient = async (payload) => {
    const response = await clientService.createClient(payload);
    setSuccessMessage("App client successfully created!");
    await refreshClients({ showLoading: false });
    return response;
  };

  const updateClient = async (payload) => {
    try {
      await clientService.updateClient(payload.id, payload);
      setSuccessMessage("App client successfully updated!");
      await refreshClients({ showLoading: false });
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  };

  const deleteClient = async (id) => {
    await clientService.deleteClient(id);
    setSuccessMessage("App client successfully deleted!");
    await refreshClients({ showLoading: false });
  };

  const getClientDetails = useCallback(async (id) => {
    const payload = await clientService.getClientById(id);
    return normalizeClientDetailPayload(payload);
  }, []);

  const rotateClientSecret = async (client) => {
    const id = typeof client === "string" ? client : client?.id;
    const name = typeof client === "string" ? "" : client?.name || "";

    if (!id) {
      setSecretModal({
        open: true,
        clientId: "",
        clientName: "",
        secret: "",
        title: "Unable to rotate client secret",
        loading: false,
        hasError: true,
      });
      return;
    }

    setSecretModal({
      open: true,
      clientId: id,
      clientName: name,
      secret: "",
      title: "Rotating client secret...",
      loading: true,
      hasError: false,
    });

    try {
      const response = await clientService.rotateClientSecret(id);
      const secret = response?.client_secret || "";

      setSecretModal({
        open: true,
        clientId: response?.client_id || id,
        clientName: name,
        secret,
        title: "Client secret rotated",
        loading: false,
        hasError: !secret,
      });
    } catch {
      setSecretModal({
        open: true,
        clientId: id,
        clientName: name,
        secret: "",
        title: "Unable to rotate client secret",
        loading: false,
        hasError: true,
      });
    }
  };

  return {
    search,
    setSearch: setSearchKeyword,
    page: currentPage,
    setPage,
    paginatedClients,
    totalPages,
    totalResults,
    loading,
    successMessage,
    setSuccessMessage,
    createClient,
    updateClient,
    deleteClient,
    getClientDetails,
    rotateClientSecret,
    secretModal,
    setSecretModal,
  };
}