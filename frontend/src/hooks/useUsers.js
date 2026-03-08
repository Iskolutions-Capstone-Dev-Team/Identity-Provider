import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // FETCH ROLES
  // =========================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getRoles(1);
        setAllRoles(data.roles || []);
      } catch (error) {
        console.error("Fetch roles error:", error);
      }
    };

    fetchRoles();
  }, []);

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNumber) => {
    try {
      const data = await userService.getUsers(pageNumber);

      const mappedUsers = (data.users || []).map((u) => ({
        id: u.id,
        username: u.user_name,
        email: u.email,
        givenName: u.first_name,
        middleName: u.middle_name,
        surname: u.last_name,
        status: u.status,
        createdAt: u.created_at,
        roles: Array.isArray(u.roles) ? u.roles : [],
        image: u.image_location || null,
      }));

      setUsers(mappedUsers);
      setTotalPages(data.last_page);
      setTotalResults(data.total_count);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  // =========================
  // CREATE USER
  // =========================
  const createUser = async (newUser) => {
    try {
      const payload = {
        email: newUser.email,
        first_name: newUser.givenName,
        middle_name: newUser.middleName,
        last_name: newUser.surname,
        user_name: newUser.username,
        password: newUser.tempPassword || "TempPass123!",
        roles: newUser.roles,
        status: newUser.status,
        imageFile: newUser.imageFile,
      };

      await userService.createUser(payload);

      setSuccessMessage("User successfully created!");
      fetchUsers(page);
    } catch (error) {
      console.error("Create user error:", error);
    }
  };

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (userId, username) => {
    try {
      await userService.deleteUser(userId);
      setSuccessMessage(`User ${username} deleted successfully`);
      fetchUsers(page);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // =========================
  // FILTER USERS
  // =========================
  const filteredUsers = users.map((u) => ({
    ...u,
    roles:
      allRoles.length > 0
        ? u.roles.filter((roleName) =>
            allRoles.some((r) => r.role_name === roleName)
          )
        : u.roles,
  })).filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.givenName} ${u.surname}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus = status ? u.status === status : true;

    return matchesSearch && matchesStatus;
  });

  return {
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    paginatedUsers: filteredUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
  };
}