import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DatabaseBackup } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { CreateBackupCard } from "../components/CreateBackupCard";
import { RestoreBackupCard } from "../components/RestoreBackupCard";
import { toast } from "sonner";
import { backupRestoreService } from "../../../services/backupRestoreService";
import { formatTimestamp } from "../../../utils/formatTimestamp";

export default function BackupRestore() {
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);
  const [latestBackup, setLatestBackup] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const fetchLatestBackup = async (signal) => {
    try {
      setLoadingLatest(true);
      const data = await backupRestoreService.getLatestBackup(signal);
      setLatestBackup(data);
    } catch (error) {
      if (error?.name !== "CanceledError") {
        console.error("Failed to fetch latest backup", error);
      }
    } finally {
      setLoadingLatest(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchLatestBackup(controller.signal);
    return () => controller.abort();
  }, []);

  const handleRunBackup = async () => {
    try {
      setLoadingBackup(true);
      const response = await backupRestoreService.runBackup();
      toast.success(response?.message || "Backup created successfully!");
      // Refresh latest backup
      fetchLatestBackup();
    } catch (error) {
      console.error("Backup failed", error);
      toast.error(error?.response?.data?.message || "Failed to create backup", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".sql.gz")) {
        toast.error("Please upload a .sql.gz file", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
        setSelectedFile(null);
        if (e.target) e.target.value = "";
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to restore", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }

    try {
      setLoadingRestore(true);
      const response = await backupRestoreService.restoreBackup(selectedFile);
      toast.success(response?.message || "Backup restored successfully!");
      setSelectedFile(null);
      // Optional: force reload page to reflect database state changes if necessary
    } catch (error) {
      console.error("Restore failed", error);
      toast.error(error?.response?.data?.message || "Failed to restore backup", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setLoadingRestore(false);
    }
  };

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
      </div>
    </>
  );
}
