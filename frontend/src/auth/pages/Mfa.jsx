import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingAuthenticators, setIsCheckingAuthenticators] =
    useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);

  const finishMfa = () => {
    promotePendingMfaTokenResponse();
    rememberMfaVerified();
    navigate(consumeMfaReturnPath(), { replace: true });
  };

  const handleCancel = async () => {
    try {
      const session = await authService.checkSession();
      const userId = session?.user_id || "";

      if (userId) {
        await authService.logout({
          clientId: authClientId,
          userId,
        });
      }
    } catch (logoutError) {
      console.error("Unable to clear MFA session:", logoutError);
    } finally {
      clearAuthState();
      navigate(buildLoginPath(authClientId), { replace: true });
    }
  };

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
            "Unable to prepare MFA. Please sign in again.",
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

  const handleSendOtp = async () => {
    setError("");

    if (!email) {
      setError("Your email address is unavailable.");
      return;
    }

    try {
      setIsSendingOtp(true);
      await passwordResetService.sendOtp({ email });
      setHasSentOtp(true);
    } catch (otpError) {
      setError(
        getRequestErrorMessage(otpError, "Unable to send an OTP right now."),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSelectEmail = () => {
    setMode("email");
    setCode("");
    setError("");
  };

  const handleSelectAuthenticator = async () => {
    setError("");
    setCode("");

    try {
      setIsCheckingAuthenticators(true);
      const hasAuthenticator = await mfaService.hasTotpAuthenticator(email);

      if (!hasAuthenticator) {
        navigate(MFA_SETUP_PATH);
        return;
      }

      navigate(MFA_AUTHENTICATOR_PATH);
    } catch (authenticatorError) {
      setError(
        getRequestErrorMessage(
          authenticatorError,
          "Unable to check your authenticator apps.",
        ),
      );
    } finally {
      setIsCheckingAuthenticators(false);
    }
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

  const handleSelectPasskey = async () => {
    setError("");
    setCode("");
    setMode("passkey");

    try {
      setIsCheckingPasskey(true);
      const hasPasskey = await mfaService.hasPasskey(email);

      if (!hasPasskey) {
        await registerPasskey();
        return;
      }

      await verifyPasskey();
    } catch (passkeyError) {
      setError(getPasskeyErrorMessage(passkeyError));
    } finally {
      setIsCheckingPasskey(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setIsVerifying(true);
      await passwordResetService.verifyOtp({
        email,
        otp: code,
      });

      finishMfa();
    } catch (verifyError) {
      setError(
        getRequestErrorMessage(verifyError, "Unable to verify this code."),
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
        <MfaVerifyStep
          email={email}
          code={code}
          mode={mode}
          hasSentOtp={hasSentOtp}
          isSendingOtp={isSendingOtp}
          isVerifying={isVerifying}
          isCheckingAuthenticators={isCheckingAuthenticators}
          isCheckingPasskey={isCheckingPasskey}
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
