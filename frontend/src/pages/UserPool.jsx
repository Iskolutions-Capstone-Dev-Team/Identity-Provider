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
import { EMPTY_CURRENT_USER, hasCurrentUserRole } from "../hooks/useCurrentUser";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

const ITEMS_PER_PAGE = 10;
const SUPERADMIN_ROLE = "idp:superadmin";

export default function UserPool() {
  const outletContext = useOutletContext();
  const currentUser = outletContext?.currentUser || EMPTY_CURRENT_USER;
  const {
    users,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    loading,
    fetchError,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const showLoading = useDelayedLoading(loading);
  const currentUserFromList =
    users.find((user) => currentUser.id && user.id === currentUser.id) ||
    users.find((user) => currentUser.email && user.email === currentUser.email) ||
    EMPTY_CURRENT_USER;
  const canDeleteUsers =
    hasCurrentUserRole(currentUser, SUPERADMIN_ROLE) ||
    hasCurrentUserRole(currentUserFromList, SUPERADMIN_ROLE);

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

    deleteUser(userToDelete.id, userToDelete.username);
    setOpenDelete(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-1 sm:px-0">
        <PageHeader
          title="Users"
          description="Manage and view user accounts in the user pool"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd"/>
            </svg>
          }
          variant="hero"
        />

        <div className="relative">
          <UserPoolCard>
            <UserPoolFilters
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              onCreate={() => setOpenAddModal(true)}
            />
            {!showLoading && fetchError && (
              <div className="alert alert-error mb-2">
                <span>{fetchError}</span>
              </div>
            )}
            <UserPoolTable
              loading={showLoading}
              users={paginatedUsers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showDeleteAction={canDeleteUsers}
            />
            {!showLoading && (
              <div className="flex flex-col gap-4 border-t border-[#7b0d15]/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
                <ResultsCount
                  page={page}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalResults={totalResults}
                  currentResultsCount={paginatedUsers.length}
                  variant="glass"
                />
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                  variant="glass"
                />
              </div>
            )}
            <UserPoolModal
              open={openViewEditModal}
              mode={modalMode}
              user={selectedUser}
              onSubmit={updateUser}
              onClose={() => setOpenViewEditModal(false)}
            />
            <AddUserModal
              open={openAddModal}
              onClose={() => setOpenAddModal(false)}
              onSubmit={createUser}
            />
          </UserPoolCard>
        </div>
      </div>
      <DeleteConfirmModal
        open={openDelete}
        message={`Delete user ${userToDelete?.username}?`}
        variant="userpool"
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
