import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consumeMfaReturnPath, MFA_AUTHENTICATOR_PATH, MFA_SETUP_PATH, rememberMfaVerified } from "../utils/mfaFlow";
import { clearAuthState, promotePendingMfaTokenResponse } from "../utils/authCookies";
import { buildLoginPath } from "../utils/loginRoute";
import { authService } from "../services/authService";
import { mfaService } from "../../services/mfaService";
import { passwordResetService } from "../../services/passwordResetService";
import { userService } from "../../services/userService";
import { createPasskeyCredential, getPasskeyCredential } from "../utils/webAuthn";
import ErrorAlert from "../../components/ErrorAlert";
import MfaLoadingStep from "../components/mfa/MfaLoadingStep";
import MfaShell from "../components/mfa/MfaShell";
import MfaVerifyStep from "../components/mfa/MfaVerifyStep";
import { getDigits } from "../components/mfa/mfaInputUtils";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function getPasskeyErrorMessage(error) {
  const message = getRequestErrorMessage(
    error,
    "Unable to check your passkeys.",
  );

  if (error?.response?.status === 401) {
    return "Passkey verification failed. Try another MFA method.";
  }

  return message;
}

const authClientId = import.meta.env.VITE_CLIENT_ID ?? "";

export default function Mfa() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (cooldown > 0 && error && error.startsWith("Too many attempts. Please wait")) {
      setError(`Too many attempts. Please wait ${cooldown}s.`);
    } else if (cooldown === 0 && error && error.startsWith("Too many attempts. Please wait")) {
      setError("");
    }
  }, [cooldown, error]);

  const finishMfa = () => {
    promotePendingMfaTokenResponse();
    rememberMfaVerified();
    navigate(consumeMfaReturnPath(), { replace: true });
  };

  const cancelMutation = useMutation({
    mutationFn: async () => {
      let userId = "";
      try {
        const session = await queryClient.fetchQuery({
          queryKey: ['loginSessionCheck', authClientId],
          queryFn: () => authService.checkSession()
        });
        userId = session?.user_id || "";
      } catch (e) {
        // ignore
      }

      if (userId) {
        await authService.logout({
          clientId: authClientId,
          userId,
        });
      }
    },
    onSettled: () => {
      clearAuthState();
      navigate(buildLoginPath(authClientId), { replace: true });
    }
  });

  const handleCancel = () => cancelMutation.mutate();

  const { data: currentUser, isLoading: isUserLoading, isError: isUserError, error: userErrorObj } = useQuery({
    queryKey: ['currentUserMfaPage'],
    queryFn: () => userService.getMe(),
    retry: false
  });

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isUserError && userErrorObj) {
      setError(
        getRequestErrorMessage(
          userErrorObj,
          "Unable to prepare MFA. Please sign in again.",
        ),
      );
    }
  }, [isUserError, userErrorObj]);

  const isLoading = isUserLoading || (!currentUser && !isUserError);

  const sendOtpMutation = useMutation({
    mutationFn: () => passwordResetService.sendOtp({ email }),
    onSuccess: () => {
      setHasSentOtp(true);
    },
    onError: (otpError) => {
      if (otpError?.response?.status === 429 || getRequestErrorMessage(otpError, "").toLowerCase().includes("limit exceeded")) {
        setCooldown(60);
        setError("Too many attempts. Please wait 60s.");
      } else {
        setError(
          getRequestErrorMessage(otpError, "Unable to send an OTP right now."),
        );
      }
    }
  });

  const handleSendOtp = () => {
    setError("");

    if (!email) {
      setError("Your email address is unavailable.");
      return;
    }

    sendOtpMutation.mutate();
  };

  const handleSelectEmail = () => {
    setMode("email");
    setCode("");
    setError("");
  };

  const checkAuthenticatorsMutation = useMutation({
    mutationFn: () => mfaService.hasTotpAuthenticator(email),
    onSuccess: (hasAuthenticator) => {
      if (!hasAuthenticator) {
        navigate(MFA_SETUP_PATH);
        return;
      }
      navigate(MFA_AUTHENTICATOR_PATH);
    },
    onError: (authenticatorError) => {
      if (authenticatorError?.response?.status === 429 || getRequestErrorMessage(authenticatorError, "").toLowerCase().includes("limit exceeded")) {
        setCooldown(60);
        setError("Too many attempts. Please wait 60s.");
      } else {
        setError(
          getRequestErrorMessage(
            authenticatorError,
            "Unable to check your authenticator apps.",
          ),
        );
      }
    }
  });

  const handleSelectAuthenticator = () => {
    setError("");
    setCode("");
    checkAuthenticatorsMutation.mutate();
  };

  const registerPasskey = async () => {
    let platformAvailable = false;
    if (window.PublicKeyCredential &&
        typeof window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      platformAvailable = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();
    }

    const options = await mfaService.beginPasskeyRegistration(
      email,
      platformAvailable,
    );
    const credential = await createPasskeyCredential(options);

    await mfaService.finishPasskeyRegistration(email, credential);
    finishMfa();
  };

  const verifyPasskey = async () => {
    let platformAvailable = false;
    if (window.PublicKeyCredential &&
        typeof window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      platformAvailable = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();
    }

    const options = await mfaService.beginPasskeyVerification(
      email,
      platformAvailable,
    );
    const credential = await getPasskeyCredential(options);

    await mfaService.finishPasskeyVerification(email, credential);
    finishMfa();
  };

  const checkPasskeyMutation = useMutation({
    mutationFn: async () => {
      const hasPasskey = await mfaService.hasPasskey(email);
      if (!hasPasskey) {
        await registerPasskey();
        return;
      }
      await verifyPasskey();
    },
    onError: (passkeyError) => {
      if (passkeyError?.response?.status === 429 || getRequestErrorMessage(passkeyError, "").toLowerCase().includes("limit exceeded")) {
        setCooldown(60);
        setError("Too many attempts. Please wait 60s.");
      } else {
        setError(getPasskeyErrorMessage(passkeyError));
      }
    }
  });

  const handleSelectPasskey = () => {
    setError("");
    setCode("");
    setMode("passkey");
    checkPasskeyMutation.mutate();
  };

  const verifyOtpMutation = useMutation({
    mutationFn: () => passwordResetService.verifyOtp({
      email,
      otp: code,
    }),
    onSuccess: () => {
      finishMfa();
    },
    onError: (verifyError) => {
      if (verifyError?.response?.status === 429 || getRequestErrorMessage(verifyError, "").toLowerCase().includes("limit exceeded")) {
        setCooldown(60);
        setError("Too many attempts. Please wait 60s.");
      } else {
        setError(
          getRequestErrorMessage(verifyError, "Unable to verify this code."),
        );
      }
    }
  });

  const handleVerify = (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    verifyOtpMutation.mutate();
  };

  return (
    <MfaShell>
      <div className="mb-5">
        <ErrorAlert message={error} onClose={() => setError("")} />
      </div>

      {isLoading ? (
        <MfaLoadingStep />
      ) : (
        <MfaVerifyStep
          email={email}
          code={code}
          mode={mode}
          hasSentOtp={hasSentOtp}
          isSendingOtp={sendOtpMutation.isPending}
          isVerifying={verifyOtpMutation.isPending}
          isCheckingAuthenticators={checkAuthenticatorsMutation.isPending}
          isCheckingPasskey={checkPasskeyMutation.isPending}
          cooldown={cooldown}
          onSelectEmail={handleSelectEmail}
          onSelectAuthenticator={handleSelectAuthenticator}
          onSelectPasskey={handleSelectPasskey}
          onCodeChange={(value) => setCode(getDigits(value))}
          onSendOtp={handleSendOtp}
          onVerify={handleVerify}
          onCancel={handleCancel}
        />
      )}
    </MfaShell>
  );
}
