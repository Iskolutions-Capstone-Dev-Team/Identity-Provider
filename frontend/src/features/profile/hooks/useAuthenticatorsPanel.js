import { useEffect, useState } from "react";
import useSWR from "swr";
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

  const fetcher = async (key) => {
    const [, userEmail] = key;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mfaService.getAuthenticators(userEmail);
  };

  const { data: authenticators = [], error: loadError, isLoading, mutate } = useSWR(
    email ? ["authenticators", email] : null,
    fetcher,
    {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        revalidateIfStale: false
    }
  );

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

  const handleDeleteAuthenticator = async () => {
    if (!authenticatorToDelete) return;
    
    setError("");
    try {
      await mfaService.deleteAuthenticator({
        email,
        id: authenticatorToDelete.id,
      });
      setAuthenticatorToDelete(null);
      toast.success("Authenticator removed successfully.");
      await mutate();
    } catch (deleteError) {
      if (deleteError?.response?.status === 429) {
        setCooldown(12);
        setError("Too many attempts. Please wait.");
      } else {
        setError(
          getRequestErrorMessage(
            deleteError,
            "Unable to remove this authenticator.",
          ),
        );
      }
    }
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
    loadAuthenticators: mutate,
    handleDeleteAuthenticator,
  };
}
