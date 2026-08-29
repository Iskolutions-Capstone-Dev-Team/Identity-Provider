import { useCallback, useEffect, useState } from "react";
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
  const [authenticators, setAuthenticators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const loadAuthenticators = useCallback(async () => {
    if (!email) {
      setAuthenticators([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const list = await mfaService.getAuthenticators(email);
      setAuthenticators(list);
    } catch (loadError) {
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
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadAuthenticators();
  }, [loadAuthenticators]);

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
      await loadAuthenticators();
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
    loadAuthenticators,
    handleDeleteAuthenticator,
  };
}
