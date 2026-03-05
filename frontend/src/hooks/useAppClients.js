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
      const data = await clientService.getClients(
        ITEMS_PER_PAGE,
        offset
      );

      const mapped = data.map((c) => ({
        id: c.id,
        clientId: c.id,
        name: c.name,
        description: c.description || "",
        created: c.created_at?.slice(0, 10) || "-",
        image: c.image_location || null,
        base_url: c.base_url,
        redirect_uri: c.redirect_uri,
        logout_uri: c.logout_uri,
      }));

      setClients(mapped);
      setTotalResults(data.length);
    } catch (err) {
      console.error("Fetch clients error:", err);
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
    await clientService.updateClient(payload.id, payload);
    setSuccessMessage("App client successfully updated!");
    await fetchClients();
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