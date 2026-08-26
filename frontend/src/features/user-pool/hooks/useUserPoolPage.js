import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { mailService } from "../../../services/mailService";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../../utils/userPoolAccess";
import { resolveReinviteAccountTypeId } from "../utils/reinviteAccountType";
import { getUserLabel } from "../utils/userLabels";
import { metricsService } from "../../../services/metricsService";

function getRequestErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useUserPoolPage({
  globalViewType,
  userType,
  setUserType,
  getUserDetails,
  deleteUser,
  setSuccessMessage,
  setFetchError,
  canEditCurrentUserType,
  canViewCurrentUserType,
  canDeleteCurrentUserType,
  canReinviteCurrentUserType,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userMetrics, setUserMetrics] = useState(null);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  useEffect(() => {
    metricsService.getUserMetrics().then(setUserMetrics).catch(() => {});
  }, []);

  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingSelectedUser, setIsLoadingSelectedUser] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openReinvite, setOpenReinvite] = useState(false);
  const [userToReinvite, setUserToReinvite] = useState(null);
  const [isSendingReinvite, setIsSendingReinvite] = useState(false);

  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("userPoolViewType") || globalViewType || "table";
  });
  
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      if (globalViewType) {
        setViewType(globalViewType);
      }
    } else {
      isMounted.current = true;
    }
  }, [globalViewType]);

  useEffect(() => {
    localStorage.setItem("userPoolViewType", viewType);
  }, [viewType]);

  const selectedUserRequestRef = useRef(0);

  useEffect(() => {
    const routeState = location.state || {};
    if (routeState.userType) setUserType(routeState.userType);
    if (routeState.successMessage) {
      toast.success(routeState.successMessage);
    }
    if (routeState.userType || routeState.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, setUserType]);

  const openUserModal = async (user, mode) => {
    const canOpenModal = mode === "edit" ? canEditCurrentUserType : canViewCurrentUserType;
    if (!canOpenModal) return;

    const requestId = selectedUserRequestRef.current + 1;
    selectedUserRequestRef.current = requestId;
    setSelectedUser(user);
    setModalMode(mode);
    setOpenViewEditModal(true);
    setIsLoadingSelectedUser(true);

    try {
      const detailedUser = await getUserDetails(user);
      if (selectedUserRequestRef.current === requestId) {
        setSelectedUser(detailedUser);
      }
    } catch (error) {
      console.error("Fetch user details error:", error);
      if (selectedUserRequestRef.current === requestId) {
        setFetchError("Unable to load the latest user details.");
      }
    } finally {
      if (selectedUserRequestRef.current === requestId) {
        setIsLoadingSelectedUser(false);
      }
    }
  };

  const handleView = (user) => openUserModal(user, "view");
  const handleEdit = (user) => openUserModal(user, "edit");
  
  const handleDeleteClick = (user) => {
    if (!canDeleteCurrentUserType) return;
    setUserToDelete(user);
    setOpenDelete(true);
  };

  const handleReinviteClick = (user) => {
    if (!canReinviteCurrentUserType) return;
    setUserToReinvite(user);
    setOpenReinvite(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id, getUserLabel(userToDelete));
      toast.success(`${userToDelete?.email} removed successfully`);
    } catch (e) {
      toast.error(`Failed to remove user`, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setOpenDelete(false);
      setUserToDelete(null);
    }
  };

  const handleConfirmReinvite = async () => {
    if (!userToReinvite || isSendingReinvite) return;
    const reinviteUserLabel = getUserLabel(userToReinvite);
    try {
      setIsSendingReinvite(true);
      setFetchError("");
      const userDetails = await getUserDetails(userToReinvite);
      const accountTypeId = await resolveReinviteAccountTypeId(userDetails);
      if (!accountTypeId) throw new Error("The user's account type is unavailable.");
      await mailService.sendInvitation({ email: userDetails.email, accountTypeId });
      setSuccessMessage(`Invitation resent to ${userDetails.email}.`);
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Reinvitation error:", error);
      setFetchError(getRequestErrorMessage(error, `Unable to resend invitation to ${reinviteUserLabel}.`));
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } finally {
      setIsSendingReinvite(false);
    }
  };

  const closeViewEditModal = () => {
    selectedUserRequestRef.current += 1;
    setIsLoadingSelectedUser(false);
    setOpenViewEditModal(false);
  };

  return {
    userMetrics,
    breadcrumbsContainer,
    openViewEditModal,
    setOpenViewEditModal,
    modalMode,
    selectedUser,
    isLoadingSelectedUser,
    openDelete,
    setOpenDelete,
    userToDelete,
    setUserToDelete,
    openReinvite,
    setOpenReinvite,
    userToReinvite,
    setUserToReinvite,
    isSendingReinvite,
    viewType,
    setViewType,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleReinviteClick,
    handleConfirmDelete,
    handleConfirmReinvite,
    closeViewEditModal,
  };
}
