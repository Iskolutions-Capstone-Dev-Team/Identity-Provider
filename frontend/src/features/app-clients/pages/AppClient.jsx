import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useAppClients } from "../hooks/useAppClients";
import Breadcrumbs from "../../../components/Breadcrumbs";
import AppClientFilters from "../components/AppClientFilters";
import ConnectedAppClientTable from "../components/ConnectedAppClientTable";
import ResultsCount from "../../../components/ResultsCount";
import Pagination from "../../../components/Pagination";
import AppClientModal from "../components/AppClientModal";
import ClientSecretModal from "../components/ClientSecretModal";
import SecretConfirmModal from "../components/SecretConfirmModal";
import SuccessAlert from "../../../components/SuccessAlert";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Monitor, MonitorCog } from "lucide-react";
import { createPortal } from "react-dom";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import MetricsCard from "../../../components/MetricsCard";
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
    const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

    useEffect(() => {
        setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
    }, []);

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

    const handleDeleteClick = (client) => {
        if (!canDeleteClient) {
            return;
        }

        setDeleteTarget(client);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteClient(deleteTarget.id || deleteTarget.clientId);
        } finally {
            setShowDeleteAlert(false);
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
                {breadcrumbsContainer && createPortal(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Client</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>,
                    breadcrumbsContainer
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary rounded-xl">
                            <MonitorCog className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Client</h1>
                            <p className="text-muted-foreground">Manage application and settings</p>
                        </div>
                    </div>

                    {canCreateClient && (
                        <Button className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Client
                        </Button>
                    )}
                </div>

                <MetricsCard
                    colorMode={colorMode}
                    isLoading={showLoading}
                    metrics={(Array.isArray(clientMetrics) ? clientMetrics : []).map((m) => ({
                        title: m.title,
                        value: m.value,
                        Icon: Monitor,
                    }))}
                />

                <div className="flex flex-col gap-5">
                    <AppClientFilters
                        search={search}
                        setSearch={setSearch}
                    />

                    <ConnectedAppClientTable
                        loading={showLoading}
                        clients={paginatedClients}
                        onView={openView}
                        onEdit={openEdit}
                        onDelete={handleDeleteClick}
                        onRotateSecret={handleRotateClick}
                        showEditAction={canEditClient}
                        showDeleteAction={canDeleteClient}
                        showRotateSecretAction={canRotateClientSecret}
                        colorMode={colorMode}
                    />

                    {!showLoading && (
                        <div className="flex flex-col items-center gap-4 pt-2 lg:grid lg:grid-cols-3">
                            <div className="flex w-full justify-center lg:justify-start">
                                <ResultsCount
                                    page={page}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    totalResults={totalResults}
                                    currentResultsCount={paginatedClients.length}
                                    variant="glass"
                                    colorMode={colorMode}
                                />
                            </div>
                            <div className="flex w-full justify-center">
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} variant="glass" colorMode={colorMode} />
                            </div>
                            <div className="hidden lg:block"></div>
                        </div>
                    )}
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
                message={`Delete ${deleteTarget?.name || 'this app client'}?`}
                theme="glass"
                colorMode={colorMode}
                onCancel={() => {
                    setShowDeleteAlert(false);
                }}
                onConfirm={confirmDelete}
            />


        </>
    );
}
