import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useOutletContext, Link, Navigate } from "react-router-dom";
import { useArchivedUsers } from "../hooks/useArchivedUsers";
import ArchivedUserPoolFilters from "../components/ArchivedUserPoolFilters";
import ArchivedUserPoolTable from "../components/ArchivedUserPoolTable";
import ArchivedUserPoolCards from "../components/ArchivedUserPoolCards";
import Pagination from "../../../components/Pagination";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import UnarchiveConfirmModal from "../../../components/UnarchiveConfirmModal";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { getUserLabel } from "../utils/userLabels";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Archive } from "lucide-react";
import { createPortal } from "react-dom";
import { hasSuperAdminRole } from "../../../utils/userPoolAccess";

const ITEMS_PER_PAGE = 10;

export default function ArchivedUsers() {
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const isSuperAdmin = hasSuperAdminRole(currentUser?.roles);

  const { appClients: appClientOptions, isLoadingAppClients } = useAllAppClients({
    enabled: !isLoadingCurrentUser,
  });

  const {
    search,
    setSearch,
    sortBy,
    setSortBy,
    sort,
    setSort,
    page,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    fetchError,
    setFetchError,
    loading,
    unarchiveUser,
    hardDeleteUser,
  } = useArchivedUsers();

  const [openHardDelete, setOpenHardDelete] = useState(false);
  const [userToHardDelete, setUserToHardDelete] = useState(null);
  
  const [openUnarchive, setOpenUnarchive] = useState(false);
  const [userToUnarchive, setUserToUnarchive] = useState(null);

  const globalViewType = outletContext.globalViewType;
  const setGlobalViewType = outletContext.setGlobalViewType;

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

  const showLoading = useDelayedLoading(loading || isLoadingAppClients || isLoadingCurrentUser);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage("");
    }
  }, [successMessage, setSuccessMessage]);

  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      setFetchError("");
    }
  }, [fetchError, setFetchError]);

  const handleUnarchiveClick = (user) => {
    setUserToUnarchive(user);
    setOpenUnarchive(true);
  };

  const handleHardDeleteClick = (user) => {
    setUserToHardDelete(user);
    setOpenHardDelete(true);
  };

  const handleConfirmUnarchive = async () => {
    if (!userToUnarchive) return;
    try {
      await unarchiveUser(userToUnarchive.id, userToUnarchive.email);
    } catch (e) {
      toast.error(`Failed to restore ${userToUnarchive.email}.`, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setOpenUnarchive(false);
      setUserToUnarchive(null);
    }
  };

  const handleConfirmHardDelete = async () => {
    if (!userToHardDelete) return;
    try {
      await hardDeleteUser(userToHardDelete.id, userToHardDelete.email);
    } catch (e) {
      toast.error(`Failed to permanently delete ${userToHardDelete.email}.`, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setOpenHardDelete(false);
      setUserToHardDelete(null);
    }
  };

  if (!isLoadingCurrentUser && !isSuperAdmin) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/user-pool">User</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Archived Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
            <Archive className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Archived Users</h1>
            <p className="text-muted-foreground">Manage removed user accounts.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ArchivedUserPoolFilters
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sort={sort}
          setSort={setSort}
          viewType={viewType}
          setViewType={handleSetViewType}
        />
        
        {viewType === "table" ? (
          <ArchivedUserPoolTable
            loading={showLoading}
            users={paginatedUsers}
            appClients={appClientOptions}
            onUnarchive={handleUnarchiveClick}
            onHardDelete={handleHardDeleteClick}
            showViewAction={false}
            showUnarchiveAction={true}
            showHardDeleteAction={true}
          />
        ) : (
          <ArchivedUserPoolCards
            loading={showLoading}
            users={paginatedUsers}
            appClients={appClientOptions}
            onUnarchive={handleUnarchiveClick}
            onHardDelete={handleHardDeleteClick}
            showViewAction={false}
            showUnarchiveAction={true}
            showHardDeleteAction={true}
          />
        )}

        {!showLoading && (
          <div className="w-full">
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalResults={totalResults}
              currentResultsCount={paginatedUsers.length}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={openHardDelete}
        message={`Permanently delete ${userToHardDelete?.email}?`}
        colorMode={colorMode}
        onCancel={() => {
          setOpenHardDelete(false);
          setUserToHardDelete(null);
        }}
        onConfirm={handleConfirmHardDelete}
      />
      
      <UnarchiveConfirmModal
        open={openUnarchive}
        message={`Restore ${userToUnarchive?.email}?`}
        colorMode={colorMode}
        onCancel={() => {
          setOpenUnarchive(false);
          setUserToUnarchive(null);
        }}
        onConfirm={handleConfirmUnarchive}
      />
    </div>
  );
}