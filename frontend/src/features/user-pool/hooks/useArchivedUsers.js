import { useEffect, useState, useCallback } from "react";
import { userService } from "../../../services/userService";
import { mapUserResponse } from "../utils/userPoolMappers";

const ITEMS_PER_PAGE = 10;
const FETCH_LIMIT = 100;



export function useArchivedUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchArchivedUsers = useCallback(async (currentSearch = "") => {
    try {
      setLoading(true);
      setFetchError("");
      
      const res = await userService.getArchivedUsers({ page: 1, limit: FETCH_LIMIT, sortBy: "created_at", order: "desc", keyword: currentSearch });
      const fetchedUsers = Array.isArray(res?.users) ? res.users : [];
      setUsers(fetchedUsers.map(u => mapUserResponse(u, { isAdmin: false })));
    } catch (error) {
      console.error("Fetch archived users error:", error);
      setFetchError("Failed to load archived users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchKeyword = typeof search === "string" ? search.trim() : "";

  useEffect(() => {
    fetchArchivedUsers(searchKeyword);
  }, [fetchArchivedUsers, searchKeyword]);

  const unarchiveUser = async (userId, label) => {
    try {
      await userService.unarchiveUser(userId);
      setSuccessMessage(`${label} has been restored successfully.`);
      await fetchArchivedUsers();
    } catch (error) {
      console.error("Unarchive error:", error);
      throw error;
    }
  };

  const hardDeleteUser = async (userId, label) => {
    try {
      await userService.hardDeleteUser(userId);
      setSuccessMessage(`${label} has been permanently deleted.`);
      await fetchArchivedUsers();
    } catch (error) {
      console.error("Hard delete error:", error);
      throw error;
    }
  };

  const totalResults = users.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  return {
    users,
    search,
    setSearch,
    page: currentPage,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    loading,
    fetchError,
    setFetchError,
    unarchiveUser,
    hardDeleteUser,
    refresh: fetchArchivedUsers,
  };
}
