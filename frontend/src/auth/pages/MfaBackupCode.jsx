import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consumeMfaReturnPath, rememberMfaVerified } from "../utils/mfaFlow";
import { mfaService } from "../../services/mfaService";
import { userService } from "../../services/userService";
import ErrorAlert from "../../components/ErrorAlert";
import MfaBackupCodeStep from "../components/mfa/MfaBackupCodeStep";
import MfaLoadingStep from "../components/mfa/MfaLoadingStep";
import MfaShell from "../components/mfa/MfaShell";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function MfaBackupCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const currentUser = await userService.getMe();

        if (!isMounted) {
          return;
        }

        setEmail(currentUser?.email || "");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          getRequestErrorMessage(
            loadError,
            "Unable to prepare backup code verification.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedBackupCode = backupCode.trim();

    if (!normalizedBackupCode) {
      setError("Enter your backup code.");
      return;
    }

    try {
      setIsVerifying(true);
      await mfaService.verifyCode({
        email,
        code: normalizedBackupCode,
      });
      rememberMfaVerified();
      navigate(consumeMfaReturnPath(), { replace: true });
    } catch (verifyError) {
      setError(
        getRequestErrorMessage(
          verifyError,
          "Unable to verify this backup code.",
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <MfaShell>
      <div className="mb-5">
        <ErrorAlert message={error} onClose={() => setError("")} />
      </div>

      {isLoading ? (
        <MfaLoadingStep />
      ) : (
        <MfaBackupCodeStep
          backupCode={backupCode}
          isVerifying={isVerifying}
          onBackupCodeChange={setBackupCode}
          onVerify={handleVerify}
        />
      )}
    </MfaShell>
  );
}