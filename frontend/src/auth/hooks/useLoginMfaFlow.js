import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { promotePendingMfaTokenResponse } from "../utils/authCookies";
import { clearMfaSetup, consumeMfaReturnPath, getMfaChallengeEmail, getMfaSetup, rememberMfaSetup, rememberMfaVerified } from "../utils/mfaFlow";
import { createPasskeyCredential, getPasskeyCredential } from "../utils/webAuthn";
import { mfaService } from "../../services/mfaService";
import { passwordResetService } from "../../services/passwordResetService";
import { userService } from "../../services/userService";

const MFA_STEPS = {
  CHOOSE: "choose",
  AUTHENTICATOR: "authenticator",
  BACKUP_CODE: "backupCode",
  SETUP: "setup",
  SETUP_CONFIRM: "setupConfirm",
};

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

export function useLoginMfaFlow({ callbackRedirectUrl = "", initialEmail = "", onBackToLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(MFA_STEPS.CHOOSE);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingAuthenticators, setIsCheckingAuthenticators] = useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [setup, setSetup] = useState({ email: "", secret: "", otpAuthUri: "" });
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);

  useEffect(() => {
    let intervalId;
    if (otpCooldown > 0) {
      intervalId = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [otpCooldown]);

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

  const finishMfa = () => {
    clearMfaSetup();
    rememberMfaVerified();
    promotePendingMfaTokenResponse();

    if (callbackRedirectUrl) {
      window.location.href = callbackRedirectUrl;
      return;
    }

    navigate(consumeMfaReturnPath(), { replace: true });
  };

  const handleFlowError = (errorObj, defaultMessage) => {
    if (errorObj?.response?.status === 429) {
      setCooldown(12);
      setInfo("");
      setError("Too many attempts. Please wait.");
      return;
    }

    const message = getRequestErrorMessage(errorObj, defaultMessage);

    if (message.toLowerCase().includes("maximum retry attempts reached")) {
      setError("");
      setInfo("Email OTP locked. Use another MFA method, or login again after 5 minutes to get a new OTP.");
      return;
    }

    if (message.toLowerCase().includes("pending cookie missing")) {
      setError("");
      setInfo("Session expired. Redirecting to login form, kindly login again.");
      setTimeout(() => {
        onBackToLogin?.();
      }, 3500);
    } else {
      setInfo("");
      setError(message);
    }
  };

  const handleFailedVerification = (errorObj, defaultMessage) => {
    const newCount = verifyAttemptCount + 1;
    setVerifyAttemptCount(newCount);

    if (newCount >= 4) {
      setCooldown(12);
      setInfo("");
      setError("Too many attempts. Please wait.");
      setVerifyAttemptCount(0);
    } else {
      handleFlowError(errorObj, defaultMessage);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const challengeEmail = initialEmail || getMfaChallengeEmail();

      if (challengeEmail) {
        setEmail(challengeEmail);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await userService.getMe();

        if (isMounted) {
          setEmail(currentUser?.email || "");
        }
      } catch (loadError) {
        if (isMounted) {
          handleFlowError(
            loadError,
            "Unable to prepare MFA. Please sign in again.",
          );
        }
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
  }, [initialEmail]);

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
      setOtpCooldown(60);
    } catch (otpError) {
      if (otpError?.response?.status === 429) {
        handleFlowError(otpError, "Too many attempts. Please wait.");
      } else {
        handleFlowError(otpError, "Unable to send an OTP right now.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSelectEmail = () => {
    setStep(MFA_STEPS.CHOOSE);
    setMode("email");
    setCode("");
    setError("");
  };

  const handleSelectAuthenticator = async () => {
    setError("");
    setCode("");
    setMode("authenticator");

    try {
      setIsCheckingAuthenticators(true);
      const hasAuthenticator = await mfaService.hasTotpAuthenticator(email);

      if (!hasAuthenticator) {
        await loadAuthenticatorSetup();
        return;
      }

      setStep(MFA_STEPS.AUTHENTICATOR);
    } catch (authenticatorError) {
      handleFlowError(
        authenticatorError,
        "Unable to check your authenticator apps.",
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

    await mfaService.finishPasskeyVerification(email, credential, rememberDevice);
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

  const loadAuthenticatorSetup = async () => {
    setStep(MFA_STEPS.SETUP);
    setQrCodeUrl("");
    setError("");

    try {
      const nextSetup = await mfaService.getSetup(email);
      const nextQrCodeUrl = await QRCode.toDataURL(nextSetup.otpAuthUri, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });

      rememberMfaSetup({ ...nextSetup, email });
      setQrCodeUrl(nextQrCodeUrl);
    } catch (setupError) {
      handleFlowError(
        setupError,
        "Unable to load authenticator setup.",
      );
    }
  };

  const handleVerifyEmailOtp = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setIsVerifying(true);
      await passwordResetService.verifyOtp({ email, otp: code, rememberDevice });
      setVerifyAttemptCount(0);
      finishMfa();
    } catch (verifyError) {
      handleFailedVerification(verifyError, "Unable to verify this code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyAuthenticator = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }

    try {
      setIsVerifying(true);
      await mfaService.verifyCode({ email, code, rememberDevice });
      setVerifyAttemptCount(0);
      finishMfa();
    } catch (verifyError) {
      handleFailedVerification(
        verifyError,
        "Unable to verify this authenticator code.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyBackupCode = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedBackupCode = backupCode.trim();

    if (!normalizedBackupCode) {
      setError("Enter your backup code.");
      return;
    }

    try {
      setIsVerifying(true);
      await mfaService.verifyCode({ email, code: normalizedBackupCode, rememberDevice });
      setVerifyAttemptCount(0);
      finishMfa();
    } catch (verifyError) {
      handleFailedVerification(
        verifyError,
        "Unable to verify this backup code.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenSetupConfirm = () => {
    const storedSetup = getMfaSetup();

    if (!storedSetup.secret) {
      setError("Authenticator setup is unavailable. Please try again.");
      return;
    }

    setSetup(storedSetup);
    setCode("");
    setStep(MFA_STEPS.SETUP_CONFIRM);
  };

  const handleBackToSetupQr = () => {
    setCode("");
    setError("");
    setStep(MFA_STEPS.SETUP);
  };

  const handleSaveAuthenticator = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    if (!name.trim()) {
      setError("Enter the authenticator app name.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await mfaService.createAuthenticator({
        email: setup.email,
        secret: setup.secret,
        code,
        name,
      });

      setBackupCodes(result.backupCodes);
    } catch (saveError) {
      handleFlowError(saveError, "Unable to save this authenticator.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    MFA_STEPS,
    step,
    setStep,
    email,
    code,
    setCode,
    backupCode,
    setBackupCode,
    mode,
    error,
    setError,
    info,
    setInfo,
    isLoading,
    hasSentOtp,
    isSendingOtp,
    isVerifying,
    isCheckingAuthenticators,
    isCheckingPasskey,
    qrCodeUrl,
    name,
    setName,
    backupCodes,
    isSaving,
    otpCooldown,
    cooldown,
    finishMfa,
    handleSendOtp,
    handleSelectEmail,
    handleSelectAuthenticator,
    handleSelectPasskey,
    handleVerifyEmailOtp,
    handleVerifyAuthenticator,
    handleVerifyBackupCode,
    handleOpenSetupConfirm,
    handleBackToSetupQr,
    handleSaveAuthenticator,
    rememberDevice,
    setRememberDevice,
  };
}
