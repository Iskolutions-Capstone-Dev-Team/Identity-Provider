import { createPortal } from "react-dom";
import { DatabaseBackup } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { CreateBackupCard } from "../components/CreateBackupCard";
import { RestoreBackupCard } from "../components/RestoreBackupCard";
import { useBackupRestore } from "../hooks/useBackupRestore";

export default function BackupRestore() {
  const {
    breadcrumbsContainer,
    latestBackup,
    loadingLatest,
    loadingBackup,
    loadingRestore,
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
              <p className="text-muted-foreground">Manage database backups and perform restoration.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <CreateBackupCard
            loadingLatest={loadingLatest}
            latestBackup={latestBackup}
            loadingBackup={runBackupMutation.isPending}
            onRunBackup={handleRunBackup}
          />
          <RestoreBackupCard
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            loadingRestore={restoreBackupMutation.isPending}
            onRestoreBackup={handleRestoreBackup}
          />
        </div>
      </div>
    </>
  );
}
