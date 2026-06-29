import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useAppClients } from "../hooks/useAppClients";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ConnectedAppClientCard from "../components/ConnectedAppClientCard";
import AppClientModal from "../components/AppClientModal";
import ClientSecretModal from "../components/ClientSecretModal";
import SecretConfirmModal from "../components/SecretConfirmModal";
import SuccessAlert from "../../../components/SuccessAlert";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import PageHeader from "../../../components/PageHeader";
import PageHeaderActionButton from "../../../components/PageHeaderActionButton";
import { AppClientIcon } from "../components/AppClientIconBox";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import MetricsCard from "../../../components/MetricsCard";
import { AppClientIcon as AppClientMetricIcon } from "../../../components/Icons";
import { metricsService } from "../../../services/metricsService";

const ITEMS_PER_PAGE = 10;

export default function AppClient() {
    const location = useLocation();
    const navigate = useNavigate();
    const { colorMode = "light" } = useOutletContext();
    const { hasPermission } = usePermissionAccess();
    const canCreateClient = hasPermission(PERMISSIONS.ADD_APPCLIENT);
    const canEditClient = hasPermission(PERMISSIONS.EDIT_APPCLIENT);
    const canDeleteClient = hasPermission(PERMISSIONS.DELETE_APPCLIENT);
    const canViewAllClients = hasPermission(PERMISSIONS.VIEW_ALL_APPCLIENTS);
    const canViewConnectedClients = hasPermission(
        PERMISSIONS.VIEW_CONNECTED_APPCLIENTS,
    );
    const canViewClientList = canViewAllClients || canViewConnectedClients;
    const [clientMetrics, setClientMetrics] = useState(null);

    useEffect(() => {
        metricsService.getClientMetrics().then(setClientMetrics).catch(() => { });
    }, []);
    const {
        search, setSearch, page, setPage,
        paginatedClients, totalPages, totalResults,
        loading,
        successMessage, setSuccessMessage,
        updateClient, deleteClient,
        getClientDetails,
        rotateClientSecret, secretModal, setSecretModal,
    } = useAppClients({ enabled: canViewClientList });
    const [editViewOpen, setEditViewOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [activeClient, setActiveClient] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showSecretConfirm, setShowSecretConfirm] = useState(false);
    const [secretTarget, setSecretTarget] = useState(null);
    const [pendingSuccessMessage, setPendingSuccessMessage] = useState("");
    const showLoading = useDelayedLoading(loading);
    const canRotateClientSecret = canEditClient;
    const closeSuccessAlert = useCallback(() => {
        setSuccessMessage("");
    }, [setSuccessMessage]);

    const openCreate = () => {
        if (!canCreateClient) {
            return;
        }

        navigate("/app-client/create");
    };

    const openView = (client) => {
        setMode("view");
        setActiveClient(client);
        setEditViewOpen(true);
    };

    const openEdit = (client) => {
        if (!canEditClient) {
            return;
        }

        setMode("edit");
        setActiveClient(client);
        setEditViewOpen(true);
    };

    const handleDeleteClick = (clientId) => {
        if (!canDeleteClient) {
            return;
        }

        setDeleteTarget(clientId);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteClient(deleteTarget);
        } finally {
            setShowDeleteAlert(false);
            setDeleteTarget(null);
        }
    };

    const handleRotateClick = (client) => {
        if (!canRotateClientSecret) {
            return;
        }

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

    return (
        <>
            <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
                <Breadcrumbs
                    colorMode={colorMode}
                    items={[
                        {
                            label: "App Client",
                        },
                    ]}
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <PageHeader
                            title="Client"
                            description="Manage application and settings"
                            icon={
                                <AppClientIcon className="h-14 w-14 sm:h-16 sm:w-16" />
                            }
                            colorMode={colorMode}
                        />
                    </div>

                    {canCreateClient && (
                        <div className="w-full sm:w-auto sm:self-center">
                            <PageHeaderActionButton colorMode={colorMode} onClick={openCreate}>
                                + Add Client
                            </PageHeaderActionButton>
                        </div>
                    )}
                </div>

                <MetricsCard
                    colorMode={colorMode}
                    isLoading={showLoading}
                    metrics={(Array.isArray(clientMetrics) ? clientMetrics : []).map((m) => ({
                        title: m.title,
                        value: m.value,
                        Icon: AppClientMetricIcon,
                    }))}
                />

                <div className="relative">
                    <ConnectedAppClientCard
                        loading={showLoading}
                        clients={paginatedClients}
                        totalResults={totalResults}
                        itemsPerPage={ITEMS_PER_PAGE}
                        search={search}
                        setSearch={setSearch}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onView={openView}
                        onEdit={openEdit}
                        onDelete={handleDeleteClick}
                        onRotateSecret={handleRotateClick}
                        showEditAction={canEditClient}
                        showDeleteAction={canDeleteClient}
                        showRotateSecretAction={canRotateClientSecret}
                        colorMode={colorMode}
                    />
                </div>
                <AppClientModal
                    open={editViewOpen}
                    mode={mode}
                    client={activeClient}
                    getClientDetails={getClientDetails}
                    onClose={() => setEditViewOpen(false)}
                    onSubmit={updateClient}
                    colorMode={colorMode}
                />
            </div>

            <ClientSecretModal
                open={secretModal.open}
                clientName={secretModal.clientName}
                clientId={secretModal.clientId}
                secret={secretModal.secret}
                loading={secretModal.loading}
                hasError={secretModal.hasError}
                onClose={resetSecretModal}
                colorMode={colorMode}
            />

            <SecretConfirmModal
                open={showSecretConfirm}
                message="Generate a new client secret?"
                onCancel={cancelRotateSecret}
                onConfirm={confirmRotateSecret}
                colorMode={colorMode}
            />

            <DeleteConfirmModal
                open={showDeleteAlert}
                message="Delete this app client?"
                theme="glass"
                colorMode={colorMode}
                onCancel={() => {
                    setShowDeleteAlert(false);
                    setDeleteTarget(null);
                }}
                onConfirm={confirmDelete}
            />

            <SuccessAlert message={successMessage} onClose={closeSuccessAlert} />
        </>
    );
}
