import { createPortal } from "react-dom";
import { DatabaseBackup, Archive } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateBackupCard } from "../components/CreateBackupCard";
import { RestoreBackupCard } from "../components/RestoreBackupCard";
import { LogRetentionCard } from "../components/LogRetentionCard";
import RetentionConfirmModal from "../components/RetentionConfirmModal";
import RetentionResultModal from "../components/RetentionResultModal";
import { useBackupRestore } from "../hooks/useBackupRestore";

export default function BackupRestore() {
  const {
    breadcrumbsContainer,
    latestBackup,
    loadingLatest,
    loadingBackup,
    loadingRestore,
    loadingRetention,
    isSuperadmin,
    isRetentionConfirmOpen,
    setIsRetentionConfirmOpen,
    retentionResult,
    isResultModalOpen,
    closeResultModal,
    handleConfirmRetention,
    selectedFile,
    handleRunBackup,
    handleFileChange,
    handleRestoreBackup,
  } = useBackupRestore();

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        {breadcrumbsContainer && createPortal(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Backup & Restore</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>,
          breadcrumbsContainer
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
              <DatabaseBackup className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
              <p className="text-muted-foreground">Manage database backups, log lifecycle archival, and system restoration.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="backup-restore" className="w-full gap-2">
          <TabsList className="grid w-full grid-cols-2 max-w-sm sm:max-w-md">
            <TabsTrigger
              value="backup-restore"
              title="Backup & Restore"
              className="min-w-0 gap-1.5 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm transition-all hover:bg-background/50 hover:text-foreground dark:hover:bg-background/40 dark:hover:text-[#f8d24e] data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-active:shadow-sm dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15]"
            >
              <DatabaseBackup className="size-3.5 sm:size-4 shrink-0" />
              <span className="truncate">Backup & Restore</span>
            </TabsTrigger>
            <TabsTrigger
              value="log-retention"
              title="Log Retention & Purge"
              className="min-w-0 gap-1.5 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm transition-all hover:bg-background/50 hover:text-foreground dark:hover:bg-background/40 dark:hover:text-[#f8d24e] data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-active:shadow-sm dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15]"
            >
              <Archive className="size-3.5 sm:size-4 shrink-0" />
              <span className="truncate">Log Retention & Purge</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backup-restore" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CreateBackupCard
                loadingLatest={loadingLatest}
                latestBackup={latestBackup}
                loadingBackup={loadingBackup}
                onRunBackup={handleRunBackup}
              />
              <RestoreBackupCard
                selectedFile={selectedFile}
                onFileChange={handleFileChange}
                loadingRestore={loadingRestore}
                onRestoreBackup={handleRestoreBackup}
              />
            </div>
          </TabsContent>

          <TabsContent value="log-retention" className="mt-0">
            <div className="w-full">
              <LogRetentionCard
                isSuperadmin={isSuperadmin}
                loadingRetention={loadingRetention}
                onOpenConfirm={() => setIsRetentionConfirmOpen(true)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RetentionConfirmModal
        open={isRetentionConfirmOpen}
        isRunning={loadingRetention}
        onCancel={() => setIsRetentionConfirmOpen(false)}
        onConfirm={handleConfirmRetention}
      />

      <RetentionResultModal
        open={isResultModalOpen}
        onClose={closeResultModal}
        result={retentionResult}
      />
    </>
  );
}
