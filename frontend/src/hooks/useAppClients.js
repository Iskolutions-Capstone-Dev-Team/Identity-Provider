import { useState, useEffect, useCallback } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 10;
const FIXED_UUID = "00000000-0000-0000-0000-000000000001";

export function useAppClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const offset = (page - 1) * ITEMS_PER_PAGE;

  // =========================
  // FETCH CLIENTS
  // =========================
  const fetchClients = useCallback(async () => {
    try {
      const { items, total } = await clientService.getClients(ITEMS_PER_PAGE, offset);

      const mapped = items.map((c) => ({
        id: c.id ?? c.client_id,
        clientId: c.id ?? c.client_id,
        name: c.name,
        tag: c.tag,
        description: c.description || "",
        created: (c.created_at || c.createdAt || "").slice(0, 10) || "-",
        image: c.image_location || c.image || null,
        base_url: c.base_url,
        redirect_uri: c.redirect_uri,
        logout_uri: c.logout_uri,
        grants: c.grants || [],
        roles: c.roles || [],
      }));

      setClients(mapped);
      setTotalResults(total);
    } catch (err) {
      console.error("Fetch clients error:", err);
      setClients([]);
      setTotalResults(0);
    }
  }, [offset]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // =========================
  // CREATE
  // =========================
  const createClient = async (payload) => {
    await clientService.createClient(payload);
    setSuccessMessage("App client successfully created!");
    await fetchClients();
  };

  // =========================
  // UPDATE
  // =========================
  const updateClient = async (payload) => {
    try {
      await clientService.updateClient(payload.id, payload);
      setSuccessMessage("App client successfully updated!");
      await fetchClients();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteClient = async (id) => {
    await clientService.deleteClient(id);
    setSuccessMessage("App client successfully deleted!");
    await fetchClients();
  };

  return {
    search,
    setSearch,
    page,
    setPage,
    paginatedClients: clients,
    totalPages: Math.ceil(totalResults / ITEMS_PER_PAGE),
    totalResults,
    successMessage,
    setSuccessMessage,
    createClient,
    updateClient,
    deleteClient,
  };
}