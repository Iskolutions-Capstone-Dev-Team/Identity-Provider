import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { consumeMfaReturnPath, rememberMfaVerified } from "../utils/mfaFlow";
import { promotePendingMfaTokenResponse } from "../utils/authCookies";
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
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUserMfaBackup'],
    queryFn: () => userService.getMe(),
    retry: false
  });

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      setError("Unable to prepare backup code verification.");
    }
  }, [isLoading, currentUser]);

  const verifyMutation = useMutation({
    mutationFn: (normalizedBackupCode) => mfaService.verifyCode({
      email,
      code: normalizedBackupCode,
    }),
    onSuccess: () => {
      promotePendingMfaTokenResponse();
      rememberMfaVerified();
      navigate(consumeMfaReturnPath(), { replace: true });
    },
    onError: (verifyError) => {
      setError(
        getRequestErrorMessage(
          verifyError,
          "Unable to verify this backup code.",
        ),
      );
    }
  });

  const handleVerify = (event) => {
    event.preventDefault();
    setError("");

    const normalizedBackupCode = backupCode.trim();

    if (!normalizedBackupCode) {
      setError("Enter your backup code.");
      return;
    }

    verifyMutation.mutate(normalizedBackupCode);
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
          isVerifying={verifyMutation.isPending}
          onBackupCodeChange={setBackupCode}
          onVerify={handleVerify}
        />
      )}
    </MfaShell>
  );
}