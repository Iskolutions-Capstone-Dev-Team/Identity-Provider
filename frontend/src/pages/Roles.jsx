import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";
import RolesListCard from "../components/role/RolesListCard";
import RoleModal from "../components/role/RoleModal";
import SuccessAlert from "../components/SuccessAlert";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/PageHeader";
import { roleService } from "../services/roleService";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

const ITEMS_PER_PAGE = 10;

export default function Roles() {
  const { colorMode = "light" } = useOutletContext() || {};
  const {
    search,
    setSearch,
    page,
    setPage,
    paginatedRoles,
    totalPages,
    totalResults,
    loading,
    successMessage,
    setSuccessMessage,
    createRole,
    updateRole,
    deleteRole,
  } = useRoles();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [activeRole, setActiveRole] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [isTagOptionsLoading, setIsTagOptionsLoading] = useState(false);
  const showLoading = useDelayedLoading(loading);

  const fetchTagOptions = useCallback(async () => {
    try {
      setIsTagOptionsLoading(true);
      const tags = await roleService.getClientTags({ limit: 50 });
      setTagOptions(tags);
    } catch (error) {
      console.error("Failed to fetch client tags:", error);
      setTagOptions([]);
    } finally {
      setIsTagOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagOptions();
  }, [fetchTagOptions]);

  const openCreate = () => {
    setMode("create");
    setActiveRole(null);
    setModalOpen(true);
  };

  const openView = (role) => {
    setMode("view");
    setActiveRole(role);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setMode("edit");
    setActiveRole(role);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    deleteRole(deleteTarget);
    setShowDeleteAlert(false);
    setDeleteTarget(null);
  };

  const handleSubmit = (data) => {
    if (mode === "create") {
      createRole(data);
    } else if (mode === "edit") {
      updateRole(data);
    }

    setModalOpen(false);
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <PageHeader
          title="Roles"
          description="Manage system roles and permissions"
          colorMode={colorMode}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
            </svg>
          }
          variant="hero"
        />

        <div className="relative">
          <RolesListCard
            loading={showLoading}
            roles={paginatedRoles}
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
            colorMode={colorMode}
          />
        </div>

        <RoleModal
          open={modalOpen}
          mode={mode}
          role={activeRole}
          tagOptions={tagOptions}
          isTagOptionsLoading={isTagOptionsLoading}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          colorMode={colorMode}
        />
      </div>

      <DeleteConfirmModal
        open={showDeleteAlert}
        message="Delete this role?"
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setShowDeleteAlert(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}