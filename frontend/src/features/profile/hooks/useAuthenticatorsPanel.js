import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mfaService } from "../../../services/mfaService";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export function useAuthenticatorsPanel({ email }) {
  const [error, setError] = useState("");
  const [authenticatorToDelete, setAuthenticatorToDelete] = useState(null);
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let intervalId;
    if (cooldown > 0) {
      intervalId = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [cooldown]);

  useEffect(() => {
    if (cooldown === 0) {
      setError((prev) => prev === "Too many attempts. Please wait." ? "" : prev);
    }
  }, [cooldown]);

  const queryClient = useQueryClient();

  const { data: authenticators = [], error: loadError, isLoading } = useQuery({
    queryKey: email ? ["authenticators", email] : null,
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return mfaService.getAuthenticators(email);
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (loadError) {
      if (loadError?.response?.status === 429) {
        setCooldown(12);
        setError("Too many attempts. Please wait.");
      } else {
        setError(
          getRequestErrorMessage(
            loadError,
            "Unable to load authenticator apps.",
          ),
        );
      }
    }
  }, [loadError]);

  const deleteAuthenticatorMutation = useMutation({
    mutationFn: (id) => mfaService.deleteAuthenticator({ email, id }),
    onSuccess: () => {
      setAuthenticatorToDelete(null);
      toast.success("Authenticator removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["authenticators", email] });
    },
    onError: (deleteError) => {
      if (deleteError?.response?.status === 429) {
        setCooldown(12);
        setError("Too many attempts. Please wait.");
      } else {
        setError(getRequestErrorMessage(deleteError, "Unable to remove this authenticator."));
      }
    }
  });

  const handleDeleteAuthenticator = () => {
    if (!authenticatorToDelete) return;
    setError("");
    deleteAuthenticatorMutation.mutate(authenticatorToDelete.id);
  };

  return {
    authenticators,
    isLoading,
    error,
    setError,
    authenticatorToDelete,
    setAuthenticatorToDelete,
    isNewConnectionOpen,
    setIsNewConnectionOpen,
    cooldown,
    loadAuthenticators: () => queryClient.invalidateQueries({ queryKey: ["authenticators", email] }),
    handleDeleteAuthenticator,
  };
}
