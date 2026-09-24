import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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

  const searchKeyword = typeof search === "string" ? search.trim() : "";

  const queryClient = useQueryClient();

  const { data: queryUsers, isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['archivedUsers', searchKeyword],
    queryFn: async () => {
      const res = await userService.getArchivedUsers({ page: 1, limit: FETCH_LIMIT, sortBy: "created_at", order: "desc", keyword: searchKeyword });
      const fetchedUsers = Array.isArray(res?.users) ? res.users : [];
      return fetchedUsers.map(u => mapUserResponse(u, { isAdmin: false }));
    }
  });

  useEffect(() => {
    if (queryUsers) {
      setUsers(queryUsers);
      setFetchError("");
    }
  }, [queryUsers]);

  useEffect(() => {
    if (queryError) {
      console.error("Fetch archived users error:", queryError);
      setFetchError("Failed to load archived users. Please try again.");
    }
  }, [queryError]);

  useEffect(() => {
    setLoading(isQueryLoading);
  }, [isQueryLoading]);

  const fetchArchivedUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['archivedUsers'] });
  };

  const unarchiveUserMutation = useMutation({
    mutationFn: async ({ userId, label }) => {
      await userService.unarchiveUser(userId);
      return label;
    },
    onSuccess: (label) => {
      setSuccessMessage(`${label} has been restored successfully.`);
      queryClient.invalidateQueries({ queryKey: ['archivedUsers'] });
    },
    onError: (error) => {
      console.error("Unarchive error:", error);
    }
  });

  const unarchiveUser = async (userId, label) => {
    return unarchiveUserMutation.mutateAsync({ userId, label });
  };

  const hardDeleteUserMutation = useMutation({
    mutationFn: async ({ userId, label }) => {
      await userService.hardDeleteUser(userId);
      return label;
    },
    onSuccess: (label) => {
      setSuccessMessage(`${label} has been permanently deleted.`);
      queryClient.invalidateQueries({ queryKey: ['archivedUsers'] });
    },
    onError: (error) => {
      console.error("Hard delete error:", error);
    }
  });

  const hardDeleteUser = async (userId, label) => {
    return hardDeleteUserMutation.mutateAsync({ userId, label });
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
