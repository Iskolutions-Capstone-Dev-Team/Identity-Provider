import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backupRestoreService } from "../../../services/backupRestoreService";
import { toast } from "sonner";

export function useBackupRestore() {
  const queryClient = useQueryClient();
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: latestBackup = null, isLoading: loadingLatest } = useQuery({
    queryKey: ['latestBackup'],
    queryFn: async ({ signal }) => {
      return backupRestoreService.getLatestBackup(signal);
    }
  });

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const runBackupMutation = useMutation({
    mutationFn: () => backupRestoreService.runBackup(),
    onSuccess: (response) => {
      toast.success(response?.message || "Backup created successfully!");
      queryClient.invalidateQueries({ queryKey: ['latestBackup'] });
    },
    onError: (error) => {
      console.error("Backup failed", error);
      toast.error(error?.response?.data?.message || "Failed to create backup", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    }
  });

  const handleRunBackup = () => {
    runBackupMutation.mutate();
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

  const restoreBackupMutation = useMutation({
    mutationFn: (file) => backupRestoreService.restoreBackup(file),
    onSuccess: (response) => {
      toast.success(response?.message || "Backup restored successfully!");
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("Restore failed", error);
      toast.error(error?.response?.data?.message || "Failed to restore backup", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    }
  });

  const handleRestoreBackup = () => {
    if (!selectedFile) {
      toast.error("Please select a file to restore", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }
    restoreBackupMutation.mutate(selectedFile);
  };

  return {
    breadcrumbsContainer,
    latestBackup,
    loadingLatest,
    loadingBackup: runBackupMutation.isPending,
    loadingRestore: restoreBackupMutation.isPending,
    selectedFile,
    handleRunBackup,
    handleFileChange,
    handleRestoreBackup,
  };
}
