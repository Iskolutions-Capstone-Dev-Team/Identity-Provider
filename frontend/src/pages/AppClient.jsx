import { useState } from "react";
import { useAppClients } from "../hooks/useAppClients";
import ConnectedAppClientCard from "../components/app-client/ConnectedAppClientCard";
import AppClientModal from "../components/app-client/AppClientModal";
import AppClientCreateModal from "../components/app-client/AppClientCreateModal";
import ClientSecretModal from "../components/app-client/ClientSecretModal";
import SuccessAlert from "../components/SuccessAlert";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/PageHeader";

const ITEMS_PER_PAGE = 10;

export default function AppClient() {
    const {
        search,
        setSearch,
        page,
        setPage,
        paginatedClients,
        totalPages,
        totalResults,
        successMessage,
        setSuccessMessage,
        createClient,
        updateClient,
        deleteClient,
        rotateClientSecret,
        secretModal,
        setSecretModal,
    } = useAppClients();

    const [createOpen, setCreateOpen] = useState(false);
    const [editViewOpen, setEditViewOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [activeClient, setActiveClient] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleCreateClient = async (payload) => {
        const res = await createClient(payload);
        setSecretModal({
            open: true,
            title: "Client secret created",
            clientId: res?.client_id || "",
            clientName: payload?.name || "",
            secret: res?.client_secret || "",
            loading: false,
            error: "",
        });
    };

    const openCreate = () => setCreateOpen(true);

    const openView = (client) => {
        setMode("view");
        setActiveClient(client);
        setEditViewOpen(true);
    };

    const openEdit = (client) => {
        setMode("edit");
        setActiveClient(client);
        setEditViewOpen(true);
    };

    const handleDeleteClick = (clientId) => {
        setDeleteTarget(clientId);
        setShowDeleteAlert(true);
    };

    const confirmDelete = () => {
        deleteClient(deleteTarget);
        setShowDeleteAlert(false);
        setDeleteTarget(null);
    };

    const resetSecretModal = () => {
        setSecretModal({
            open: false,
            clientId: "",
            clientName: "",
            secret: "",
            title: "",
            loading: false,
            error: "",
        });
    };

    return (
        <>
            <div className="flex flex-col items-center gap-6 px-3 sm:px-6">
                <PageHeader
                    title="App Client"
                    description="Manage application clients and settings"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-28 h-28 text-[#991b1b]">
                            <path d="M16.555 5.412a8.028 8.028 0 0 0-3.503-2.81 14.899 14.899 0 0 1 1.663 4.472 8.547 8.547 0 0 0 1.84-1.662ZM13.326 7.825a13.43 13.43 0 0 0-2.413-5.773 8.087 8.087 0 0 0-1.826 0 13.43 13.43 0 0 0-2.413 5.773A8.473 8.473 0 0 0 10 8.5c1.18 0 2.304-.24 3.326-.675ZM6.514 9.376A9.98 9.98 0 0 0 10 10c1.226 0 2.4-.22 3.486-.624a13.54 13.54 0 0 1-.351 3.759A13.54 13.54 0 0 1 10 13.5c-1.079 0-2.128-.127-3.134-.366a13.538 13.538 0 0 1-.352-3.758ZM5.285 7.074a14.9 14.9 0 0 1 1.663-4.471 8.028 8.028 0 0 0-3.503 2.81c.529.638 1.149 1.199 1.84 1.66ZM17.334 6.798a7.973 7.973 0 0 1 .614 4.115 13.47 13.47 0 0 1-3.178 1.72 15.093 15.093 0 0 0 .174-3.939 10.043 10.043 0 0 0 2.39-1.896ZM2.666 6.798a10.042 10.042 0 0 0 2.39 1.896 15.196 15.196 0 0 0 .174 3.94 13.472 13.472 0 0 1-3.178-1.72 7.973 7.973 0 0 1 .615-4.115ZM10 15c.898 0 1.778-.079 2.633-.23a13.473 13.473 0 0 1-1.72 3.178 8.099 8.099 0 0 1-1.826 0 13.47 13.47 0 0 1-1.72-3.178c.855.151 1.735.23 2.633.23ZM14.357 14.357a14.912 14.912 0 0 1-1.305 3.04 8.027 8.027 0 0 0 4.345-4.345c-.953.542-1.971.981-3.04 1.305ZM6.948 17.397a8.027 8.027 0 0 1-4.345-4.345c.953.542 1.971.981 3.04 1.305a14.912 14.912 0 0 0 1.305 3.04Z" />
                        </svg>
                    }
                />
                <ConnectedAppClientCard
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
                    onCreate={openCreate}
                    onRotateSecret={rotateClientSecret}
                />
                <AppClientCreateModal
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreateClient}
                />
                <AppClientModal
                    open={editViewOpen}
                    mode={mode}
                    client={activeClient}
                    onClose={() => setEditViewOpen(false)}
                    onSubmit={updateClient}
                />
            </div>

            <ClientSecretModal
                open={secretModal.open}
                clientName={secretModal.clientName}
                clientId={secretModal.clientId}
                secret={secretModal.secret}
                loading={secretModal.loading}
                error={secretModal.error}
                onClose={resetSecretModal}
            />

            <DeleteConfirmModal
                open={showDeleteAlert}
                message="Delete this app client?"
                onCancel={() => {
                    setShowDeleteAlert(false);
                    setDeleteTarget(null);
                }}
                onConfirm={confirmDelete}
            />

            <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />
        </>
    );
}
