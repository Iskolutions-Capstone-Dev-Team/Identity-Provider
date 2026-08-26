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
      setError(
        getRequestErrorMessage(
          loadError,
          "Unable to load authenticator apps.",
        ),
      );
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
      setError(
        getRequestErrorMessage(
          deleteError,
          "Unable to remove this authenticator.",
        ),
      );
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
    loadAuthenticators,
    handleDeleteAuthenticator,
  };
}
