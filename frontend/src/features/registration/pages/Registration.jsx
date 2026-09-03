import Pagination from "../../../components/Pagination";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { createPortal } from "react-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import RegistrationConfigModal from "../components/RegistrationConfigModal";
import RegistrationSyncConfirmModal from "../components/RegistrationSyncConfirmModal";
import RegistrationListCard from "../components/RegistrationListCard";
import RegistrationFilters from "../components/RegistrationFilters";
import { Plus, FileText, FileCheckCorner } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetricsCard from "../../../components/MetricsCard";
import { useRegistrationPage } from "../hooks/useRegistrationPage";

const ITEMS_PER_PAGE = 10;

export default function Registration() {
  const pageState = useRegistrationPage();
  const {
    breadcrumbsContainer,
    colorMode,
    canCreateRegistration,
    canEditRegistration,
    canDeleteRegistration,
    registrationMetrics,
    shouldLoadEditableAppClients,
    isLoadingAppClients,
    appClientsError,
    registrationError,
    search,
    setSearchKeyword,
    page,
    setPage,
    limit,
    sortBy,
    setSortBy,
    sort,
    setSort,
    viewType,
    setViewType,
    totalPages,
    totalResults,
    selectedConfig,
    modalMode,
    deleteTarget,
    setDeleteTarget,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    syncTarget,
    isSyncingUsers,
    showLoading,
    isDarkMode,
    appClientOptions,
    rows,
    handleOpenCreate,
    handleOpenView,
    handleOpenEdit,
    handleDeleteClick,
    handleCloseModal,
    handleSave,
    handleCancelSync,
    handleConfirmSync,
    handleConfirmDelete
  } = pageState;

  const errorBoxClassName = isDarkMode
    ? "rounded-[1.75rem] border border-[#f8d24e]/15 bg-[linear-gradient(180deg,rgba(48,18,24,0.96),rgba(27,16,21,0.96))] px-6 py-12 text-center text-sm font-medium text-[#f2dfe2] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.75)]"
    : "rounded-[1.75rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-6 py-12 text-center text-sm font-medium text-[#991b1b] shadow-[0_22px_55px_-38px_rgba(43,3,7,0.35)]";
  
  const infoBoxClassName = isDarkMode
    ? "rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-[#d6c3c7]"
    : "rounded-[1.4rem] border border-[#7b0d15]/10 bg-white/75 px-5 py-4 text-sm text-[#6f4f56]";
  
  const warningBoxClassName = isDarkMode
    ? "rounded-[1.4rem] border border-[#f8d24e]/20 bg-[#f8d24e]/10 px-5 py-4 text-sm text-[#ffe28a]"
    : "rounded-[1.4rem] border border-[#f8d24e]/45 bg-[#fff4dc] px-5 py-4 text-sm text-[#7b0d15]";

  let tableContent = null;
  let showTableFooter = true;

  if (registrationError) {
    tableContent = <div className={errorBoxClassName}>{registrationError}</div>;
    showTableFooter = false;
  }

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        {breadcrumbsContainer && createPortal(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Registration</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>,
          breadcrumbsContainer
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
              <FileCheckCorner className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Registration</h1>
              <p className="text-muted-foreground">Configure pre-approved app clients for each account type.</p>
            </div>
          </div>

          {canCreateRegistration && (
            <Button 
              className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account Type
            </Button>
          )}
        </div>

        <MetricsCard
          colorMode={colorMode}
          isLoading={showLoading}
          metrics={(Array.isArray(registrationMetrics) ? registrationMetrics : [])
            .filter((m) => m.title !== "Pending Invitations")
            .map((m) => ({
            title: m.title,
            value: m.value,
            Icon: FileText,
          }))}
        />

        <div className="flex flex-col gap-5">
          <RegistrationFilters
            search={search}
            setSearch={setSearchKeyword}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sort={sort}
            setSort={setSort}
            viewType={viewType}
            setViewType={setViewType}
          />
          <RegistrationListCard
            loading={showLoading}
            rows={rows}
            viewType={viewType}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteClick}
            tableContent={tableContent}
            showFooter={showTableFooter}
            showEditAction={canEditRegistration}
            showDeleteAction={canDeleteRegistration}
            colorMode={colorMode}
          >
            {!showLoading && !registrationError && appClientsError && (
              shouldLoadEditableAppClients ? (
                <div className={warningBoxClassName}>{appClientsError}</div>
              ) : null
            )}

            {!showLoading &&
              !registrationError &&
              shouldLoadEditableAppClients &&
              !appClientsError &&
              appClientOptions.length === 0 && (
                <div className={infoBoxClassName}>
                  No app clients are available yet. Add app clients first to
                  configure registration access.
                </div>
              )}
          </RegistrationListCard>
          
          {showTableFooter && !showLoading && (
            <div className="w-full">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                itemsPerPage={limit}
                totalResults={totalResults}
                currentResultsCount={rows.length}
                variant="glass"
                colorMode={colorMode}
              />
            </div>
          )}
        </div>
      </div>

      <RegistrationConfigModal
        open={Boolean(selectedConfig)}
        mode={modalMode}
        config={selectedConfig}
        appClientOptions={appClientOptions}
        isLoadingAppClients={isLoadingAppClients}
        appClientsError={appClientsError}
        onClose={handleCloseModal}
        onSave={handleSave}
        colorMode={colorMode}
      />

      <DeleteConfirmModal
        open={isDeleteConfirmOpen}
        message={`Delete ${deleteTarget?.label || "this"} account type?`}
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setDeleteTarget(null);
          setIsDeleteConfirmOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />

      <RegistrationSyncConfirmModal
        open={Boolean(syncTarget)}
        accountTypeLabel={syncTarget?.label || "this account type"}
        isSubmitting={isSyncingUsers}
        colorMode={colorMode}
        onCancel={handleCancelSync}
        onConfirm={handleConfirmSync}
      />
    </>
  );
}
