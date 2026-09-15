import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [setup, setSetup] = useState({ email: "", secret: "", otpAuthUri: "" });
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(false);

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

  const { isLoading: isUserLoading } = useQuery({
    queryKey: ['mfaCurrentUser', initialEmail],
    queryFn: async () => {
      const challengeEmail = initialEmail || getMfaChallengeEmail();
      if (challengeEmail) {
        setEmail(challengeEmail);
        return { email: challengeEmail };
      }
      try {
        const currentUser = await userService.getMe();
        setEmail(currentUser?.email || "");
        return currentUser;
      } catch (loadError) {
        handleFlowError(loadError, "Unable to prepare MFA. Please sign in again.");
        throw loadError;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const sendOtpMutation = useMutation({
    mutationFn: (userEmail) => passwordResetService.sendOtp({ email: userEmail }),
    onSuccess: () => {
      setHasSentOtp(true);
      setOtpCooldown(60);
    },
    onError: (otpError) => {
      if (otpError?.response?.status === 429) {
        handleFlowError(otpError, "Too many attempts. Please wait.");
      } else {
        handleFlowError(otpError, "Unable to send an OTP right now.");
      }
    }
  });

  const handleSendOtp = async () => {
    setError("");
    if (!email) {
      setError("Your email address is unavailable.");
      return;
    }
    sendOtpMutation.mutate(email);
  };

  const handleSelectEmail = () => {
    setStep(MFA_STEPS.CHOOSE);
    setMode("email");
    setCode("");
    setError("");
  };

  const loadAuthenticatorSetupMutation = useMutation({
    mutationFn: async (userEmail) => {
      const nextSetup = await mfaService.getSetup(userEmail);
      const nextQrCodeUrl = await QRCode.toDataURL(nextSetup.otpAuthUri, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });
      return { nextSetup, nextQrCodeUrl };
    },
    onSuccess: ({ nextSetup, nextQrCodeUrl }) => {
      rememberMfaSetup({ ...nextSetup, email });
      setQrCodeUrl(nextQrCodeUrl);
      setStep(MFA_STEPS.SETUP);
    },
    onError: (setupError) => {
      handleFlowError(setupError, "Unable to load authenticator setup.");
    }
  });

  const checkAuthenticatorsMutation = useMutation({
    mutationFn: (userEmail) => mfaService.hasTotpAuthenticator(userEmail),
    onSuccess: (hasAuthenticator) => {
      if (!hasAuthenticator) {
        setStep(MFA_STEPS.SETUP);
        setQrCodeUrl("");
        setError("");
        loadAuthenticatorSetupMutation.mutate(email);
        return;
      }
      setStep(MFA_STEPS.AUTHENTICATOR);
    },
    onError: (authenticatorError) => {
      handleFlowError(authenticatorError, "Unable to check your authenticator apps.");
    }
  });

  const handleSelectAuthenticator = () => {
    setError("");
    setCode("");
    setMode("authenticator");
    checkAuthenticatorsMutation.mutate(email);
  };

  const checkPasskeyMutation = useMutation({
    mutationFn: async (userEmail) => {
      const hasPasskey = await mfaService.hasPasskey(userEmail);
      let platformAvailable = false;
      if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
        platformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }

      if (!hasPasskey) {
        const options = await mfaService.beginPasskeyRegistration(userEmail, platformAvailable);
        const credential = await createPasskeyCredential(options);
        await mfaService.finishPasskeyRegistration(userEmail, credential, rememberDevice);
      } else {
        const options = await mfaService.beginPasskeyVerification(userEmail, platformAvailable);
        const credential = await getPasskeyCredential(options);
        await mfaService.finishPasskeyVerification(userEmail, credential, rememberDevice);
      }
    },
    onSuccess: () => {
      finishMfa();
    },
    onError: (passkeyError) => {
      setError(getPasskeyErrorMessage(passkeyError));
    }
  });

  const handleSelectPasskey = () => {
    setError("");
    setCode("");
    setMode("passkey");
    checkPasskeyMutation.mutate(email);
  };

  const verifyEmailOtpMutation = useMutation({
    mutationFn: () => passwordResetService.verifyOtp({ email, otp: code, rememberDevice }),
    onSuccess: () => {
      setVerifyAttemptCount(0);
      finishMfa();
    },
    onError: (verifyError) => {
      handleFailedVerification(verifyError, "Unable to verify this code.");
    }
  });

  const handleVerifyEmailOtp = (event) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    verifyEmailOtpMutation.mutate();
  };

  const verifyAuthenticatorMutation = useMutation({
    mutationFn: () => mfaService.verifyCode({ email, code, rememberDevice }),
    onSuccess: () => {
      setVerifyAttemptCount(0);
      finishMfa();
    },
    onError: (verifyError) => {
      handleFailedVerification(verifyError, "Unable to verify this authenticator code.");
    }
  });

  const handleVerifyAuthenticator = (event) => {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }
    verifyAuthenticatorMutation.mutate();
  };

  const verifyBackupCodeMutation = useMutation({
    mutationFn: (normalizedBackupCode) => mfaService.verifyCode({ email, code: normalizedBackupCode, rememberDevice }),
    onSuccess: () => {
      setVerifyAttemptCount(0);
      finishMfa();
    },
    onError: (verifyError) => {
      handleFailedVerification(verifyError, "Unable to verify this backup code.");
    }
  });

  const handleVerifyBackupCode = (event) => {
    event.preventDefault();
    setError("");
    const normalizedBackupCode = backupCode.trim();
    if (!normalizedBackupCode) {
      setError("Enter your backup code.");
      return;
    }
    verifyBackupCodeMutation.mutate(normalizedBackupCode);
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

  const saveAuthenticatorMutation = useMutation({
    mutationFn: () => mfaService.createAuthenticator({
      email: setup.email,
      secret: setup.secret,
      code,
      name,
      rememberDevice,
    }),
    onSuccess: (result) => {
      setBackupCodes(result.backupCodes);
    },
    onError: (saveError) => {
      handleFlowError(saveError, "Unable to save this authenticator.");
    }
  });

  const handleSaveAuthenticator = (event) => {
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
    saveAuthenticatorMutation.mutate();
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
    isLoading: isUserLoading,
    hasSentOtp,
    isSendingOtp: sendOtpMutation.isPending,
    isVerifying: verifyEmailOtpMutation.isPending || verifyAuthenticatorMutation.isPending || verifyBackupCodeMutation.isPending,
    isCheckingAuthenticators: checkAuthenticatorsMutation.isPending || loadAuthenticatorSetupMutation.isPending,
    isCheckingPasskey: checkPasskeyMutation.isPending,
    qrCodeUrl,
    name,
    setName,
    backupCodes,
    isSaving: saveAuthenticatorMutation.isPending,
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
