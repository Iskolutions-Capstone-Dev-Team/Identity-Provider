import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deviceService } from "../../../services/deviceService";

export function useRememberedDevices() {
    const [errorMessage, setErrorMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const [isRenameModalOpen, setRenameModalOpen] = useState(false);
    const [pendingRenameDevice, setPendingRenameDevice] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);

    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteDevice, setPendingDeleteDevice] = useState(null);

    const queryClient = useQueryClient();

    const { data: devices = [], error, isLoading } = useQuery({
        queryKey: ["trusted_devices"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return deviceService.getDevices();
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (error) {
            if (error?.response?.status === 401) {
                return;
            }
            if (error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.response?.data?.message || error.message || "Failed to load trusted devices.");
            }
        }
    }, [error]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleRenameClick = (device) => {
        setPendingRenameDevice(device);
        setRenameModalOpen(true);
    };

    const renameMutation = useMutation({
        mutationFn: (newName) => deviceService.updateDevice({ id: pendingRenameDevice.id, name: newName }),
        onSuccess: () => {
            toast.success("Device renamed successfully.");
            setRenameModalOpen(false);
            setPendingRenameDevice(null);
            queryClient.invalidateQueries({ queryKey: ["trusted_devices"] });
        },
        onError: (error) => {
            if (error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.response?.data?.message || error.message || "Failed to rename device.");
            }
        }
    });

    const handleRenameSave = (newName) => {
        if (!pendingRenameDevice) return;
        setErrorMessage("");
        renameMutation.mutate(newName);
    };

    const handleRenameCancel = () => {
        setRenameModalOpen(false);
        setPendingRenameDevice(null);
    };

    const handleDeleteClick = (device) => {
        setPendingDeleteDevice(device);
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => deviceService.deleteDevice({ id }),
        onSuccess: () => {
            toast.success("Device removed successfully.");
            setPendingDeleteDevice(null);
            queryClient.invalidateQueries({ queryKey: ["trusted_devices"] });
        },
        onError: (error) => {
            if (error?.response?.status === 429) {
                setCooldown(20);
                setErrorMessage("Too many attempts. Please wait.");
            } else {
                setErrorMessage(error.response?.data?.message || error.message || "Failed to remove device.");
            }
        }
    });

    const handleConfirmDelete = () => {
        if (!pendingDeleteDevice) return;
        setErrorMessage("");
        deleteMutation.mutate(pendingDeleteDevice.id);
    };

    const handleCancelDelete = () => {
        setPendingDeleteDevice(null);
    };

    return {
        devices,
        isLoading,
        errorMessage,
        cooldown,

        isRenameModalOpen,
        pendingRenameDevice,
        isRenaming: renameMutation.isPending,
        handleRenameClick,
        handleRenameSave,
        handleRenameCancel,

        deletingId: deleteMutation.isPending ? pendingDeleteDevice?.id : null,
        pendingDeleteDevice,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
    };
}
