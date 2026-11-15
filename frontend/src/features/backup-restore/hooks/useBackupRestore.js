import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backupRestoreService } from "../../../services/backupRestoreService";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { hasSuperAdminRole } from "../../../utils/userPoolAccess";
import { toast } from "sonner";

export function useBackupRestore() {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
  const isSuperadmin = hasSuperAdminRole(currentUser?.roles || []);

  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRetentionConfirmOpen, setIsRetentionConfirmOpen] = useState(false);
  const [retentionResult, setRetentionResult] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

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

  const retentionMutation = useMutation({
    mutationFn: () => backupRestoreService.triggerRetentionRun(),
    onSuccess: (data) => {
      toast.success("Log retention process completed successfully.");
      setRetentionResult(data);
      setIsRetentionConfirmOpen(false);
      setIsResultModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['logMetrics'] });
    },
    onError: (error) => {
      console.error("Log retention run failed", error);
      const msg = error?.response?.data?.message || "Failed to execute log retention.";
      toast.error(msg, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    },
  });

  const handleConfirmRetention = () => {
    retentionMutation.mutate();
  };

  const closeResultModal = () => {
    setIsResultModalOpen(false);
    setRetentionResult(null);
  };

  return {
    breadcrumbsContainer,
    latestBackup,
    loadingLatest,
    loadingBackup: runBackupMutation.isPending,
    loadingRestore: restoreBackupMutation.isPending,
    loadingRetention: retentionMutation.isPending,
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
  };
}
