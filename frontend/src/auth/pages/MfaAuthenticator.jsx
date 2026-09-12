import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { consumeMfaReturnPath, rememberMfaVerified } from "../utils/mfaFlow";
import { promotePendingMfaTokenResponse } from "../utils/authCookies";
import { mfaService } from "../../services/mfaService";
import { userService } from "../../services/userService";
import ErrorAlert from "../../components/ErrorAlert";
import MfaAuthenticatorCodeStep from "../components/mfa/MfaAuthenticatorCodeStep";
import MfaLoadingStep from "../components/mfa/MfaLoadingStep";
import MfaShell from "../components/mfa/MfaShell";
import { getDigits } from "../components/mfa/mfaInputUtils";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function MfaAuthenticator() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUserMfaAuth'],
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
      setError("Unable to prepare authenticator verification.");
    }
  }, [isLoading, currentUser]);

  const verifyMutation = useMutation({
    mutationFn: () => mfaService.verifyCode({ email, code }),
    onSuccess: () => {
      promotePendingMfaTokenResponse();
      rememberMfaVerified();
      navigate(consumeMfaReturnPath(), { replace: true });
    },
    onError: (verifyError) => {
      setError(
        getRequestErrorMessage(
          verifyError,
          "Unable to verify this authenticator code.",
        ),
      );
    }
  });

  const handleVerify = (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }

    verifyMutation.mutate();
  };

  return (
    <MfaShell>
      <div className="mb-5">
        <ErrorAlert message={error} onClose={() => setError("")} />
      </div>

      {isLoading ? (
        <MfaLoadingStep />
      ) : (
        <MfaAuthenticatorCodeStep
          code={code}
          isVerifying={verifyMutation.isPending}
          onCodeChange={(value) => setCode(getDigits(value))}
          onVerify={handleVerify}
        />
      )}
    </MfaShell>
  );
}