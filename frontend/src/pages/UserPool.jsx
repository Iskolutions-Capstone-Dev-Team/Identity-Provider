import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import UserPoolCard from "../components/user-pool/UserPoolCard";
import UserPoolFilters from "../components/user-pool/UserPoolFilters";
import UserPoolTable from "../components/user-pool/UserPoolTable";
import Pagination from "../components/Pagination";
import UserPoolModal from "../components/user-pool/UserPoolModal";
import AddUserModal from "../components/user-pool/AddUserModal";
import SuccessAlert from "../components/SuccessAlert";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ResultsCount from "../components/ResultsCount";
import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import { EMPTY_CURRENT_USER, hasCurrentUserRole } from "../hooks/useCurrentUser";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { useManagedUserAccessClients } from "../hooks/useManagedUserAccessClients";
import { REGULAR_USER_TYPE } from "../utils/userPoolAccess";

const ITEMS_PER_PAGE = 10;
const SUPERADMIN_ROLE = "idp:superadmin";

function getUserLabel(user) {
  return user?.displayName || user?.email || "User";
}

export default function UserPool() {
  const outletContext = useOutletContext() || {};
  const currentUser = outletContext.currentUser || EMPTY_CURRENT_USER;
  const colorMode = outletContext.colorMode || "light";
  const isDarkMode = colorMode === "dark";
  const {
    search,
    setSearch,
    userType,
    setUserType,
    status,
    setStatus,
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
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const { appClients, isLoadingAppClients } = useManagedUserAccessClients();
  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const showLoading = useDelayedLoading(
    loading || (userType === REGULAR_USER_TYPE && isLoadingAppClients),
  );
  const canDeleteUsers = hasCurrentUserRole(currentUser, SUPERADMIN_ROLE);
  const footerClassName = `flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;

  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setOpenViewEditModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setOpenViewEditModal(true);
  };

  const handleDeleteClick = (user) => {
    if (!canDeleteUsers) {
      return;
    }

    setUserToDelete(user);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) {
      return;
    }

    deleteUser(userToDelete.id, getUserLabel(userToDelete));
    setOpenDelete(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <PageHeader
          title="Users"
          description="Manage and view user accounts in the user pool"
          colorMode={colorMode}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd"/>
            </svg>
          }
          variant="hero"
        />

        <div className="relative">
          <UserPoolCard colorMode={colorMode}>
            <ErrorAlert
              message={fetchError}
              onClose={() => setFetchError("")}
            />
            <UserPoolFilters
              search={search}
              setSearch={setSearch}
              userType={userType}
              setUserType={setUserType}
              status={status}
              setStatus={setStatus}
              onCreate={() => setOpenAddModal(true)}
              colorMode={colorMode}
            />
            <UserPoolTable
              loading={showLoading}
              users={paginatedUsers}
              userType={userType}
              appClients={appClients}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showDeleteAction={canDeleteUsers}
              colorMode={colorMode}
            />
            {!showLoading && (
              <div className={footerClassName}>
                <ResultsCount
                  page={page}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalResults={totalResults}
                  currentResultsCount={paginatedUsers.length}
                  variant="glass"
                  colorMode={colorMode}
                />
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                  variant="glass"
                  colorMode={colorMode}
                />
              </div>
            )}
            <UserPoolModal
              open={openViewEditModal}
              mode={modalMode}
              user={selectedUser}
              userType={userType}
              appClientOptions={appClients}
              isLoadingAppClients={isLoadingAppClients}
              onSubmit={updateUser}
              onClose={() => setOpenViewEditModal(false)}
              colorMode={colorMode}
            />
            <AddUserModal
              open={openAddModal}
              onClose={() => setOpenAddModal(false)}
              onSubmit={createUser}
              userType={userType}
              colorMode={colorMode}
            />
          </UserPoolCard>
        </div>
      </div>
      <DeleteConfirmModal
        open={openDelete}
        message={`Delete user ${getUserLabel(userToDelete)}?`}
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setOpenDelete(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}