import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { metricsService } from "../../../services/metricsService";

export function useAppClientPage({
  globalViewType,
  setGlobalViewType,
  canCreateClient,
  canEditClient,
  canDeleteClient,
  canRotateClientSecret,
  rotateClientSecret,
  deleteClient,
  secretModal,
  setSecretModal,
  setSuccessMessage,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [clientMetrics, setClientMetrics] = useState(null);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  useEffect(() => {
    metricsService.getClientMetrics().then(setClientMetrics).catch(() => { });
  }, []);

  const [editViewOpen, setEditViewOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [activeClient, setActiveClient] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSecretConfirm, setShowSecretConfirm] = useState(false);
  const [secretTarget, setSecretTarget] = useState(null);
  const [pendingSuccessMessage, setPendingSuccessMessage] = useState("");

  const [viewType, setViewType] = useState(() => {
    return globalViewType || "table";
  });

  const handleSetViewType = (newViewType) => {
    setViewType(newViewType);
    if (setGlobalViewType) {
      setGlobalViewType(newViewType);
    }
  };

  useEffect(() => {
    if (globalViewType) {
      setViewType(globalViewType);
    }
  }, [globalViewType]);

  const openCreate = () => {
    if (!canCreateClient) return;
    navigate("/app-client/create");
  };

  const openView = (client) => {
    setMode("view");
    setActiveClient(client);
    setEditViewOpen(true);
  };

  const openEdit = (client) => {
    if (!canEditClient) return;
    setMode("edit");
    setActiveClient(client);
    setEditViewOpen(true);
  };

  const handleDeleteClick = (client) => {
    if (!canDeleteClient) return;
    setDeleteTarget(client);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id || deleteTarget.clientId);
    } finally {
      setShowDeleteAlert(false);
    }
  };

  const handleRotateClick = (client) => {
    if (!canRotateClientSecret) return;
    setSecretTarget(client || null);
    setShowSecretConfirm(true);
  };

  const cancelRotateSecret = () => {
    setShowSecretConfirm(false);
    setSecretTarget(null);
  };

  const confirmRotateSecret = async () => {
    if (!secretTarget) return;
    await rotateClientSecret(secretTarget);
    setShowSecretConfirm(false);
    setSecretTarget(null);
  };

  const resetSecretModal = () => {
    setSecretModal({
      open: false,
      clientId: "",
      clientName: "",
      secret: "",
      title: "",
      loading: false,
      hasError: false,
    });

    if (pendingSuccessMessage) {
      setSuccessMessage(pendingSuccessMessage);
      setPendingSuccessMessage("");
    }
  };

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.secretModal) {
      setSecretModal(routeState.secretModal);
      if (routeState.successMessage) {
        setPendingSuccessMessage(routeState.successMessage);
      }
    } else if (routeState.successMessage) {
      setSuccessMessage(routeState.successMessage);
    }

    if (routeState.successMessage || routeState.secretModal) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
    setSecretModal,
    setSuccessMessage,
  ]);

  return {
    clientMetrics,
    breadcrumbsContainer,
    editViewOpen,
    setEditViewOpen,
    mode,
    activeClient,
    showDeleteAlert,
    setShowDeleteAlert,
    deleteTarget,
    showSecretConfirm,
    viewType,
    setViewType: handleSetViewType,
    openCreate,
    openView,
    openEdit,
    handleDeleteClick,
    confirmDelete,
    handleRotateClick,
    cancelRotateSecret,
    confirmRotateSecret,
    resetSecretModal,
  };
}
