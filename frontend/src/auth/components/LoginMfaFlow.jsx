import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { promotePendingMfaTokenResponse } from "../utils/authCookies";
import { clearMfaSetup, consumeMfaReturnPath, getMfaChallengeEmail, getMfaSetup, rememberMfaSetup, rememberMfaVerified } from "../utils/mfaFlow";
import { createPasskeyCredential, getPasskeyCredential } from "../utils/webAuthn";
import { mfaService } from "../../services/mfaService";
import { passwordResetService } from "../../services/passwordResetService";
import { userService } from "../../services/userService";
import ErrorAlert from "../../components/ErrorAlert";
import MfaAuthenticatorCodeStep from "./mfa/MfaAuthenticatorCodeStep";
import MfaBackupCodeStep from "./mfa/MfaBackupCodeStep";
import MfaLoadingStep from "./mfa/MfaLoadingStep";
import MfaSetupConfirmStep from "./mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "./mfa/MfaSetupQrStep";
import MfaVerifyStep from "./mfa/MfaVerifyStep";
import { getDigits } from "./mfa/mfaInputUtils";

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

export default function LoginMfaFlow({ callbackRedirectUrl = "", initialEmail = "", isReturningToLogin = false, onBackToLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(MFA_STEPS.CHOOSE);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [mode, setMode] = useState("email");
  const [error, setError] = useState("");
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

  const finishMfa = () => {
    clearMfaSetup();
    rememberMfaVerified();

    if (callbackRedirectUrl) {
      window.location.href = callbackRedirectUrl;
      return;
    }

    promotePendingMfaTokenResponse();
    navigate(consumeMfaReturnPath(), { replace: true });
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
          setError(
            getRequestErrorMessage(
              loadError,
              "Unable to prepare MFA. Please sign in again.",
            ),
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
    } catch (otpError) {
      setError(
        getRequestErrorMessage(otpError, "Unable to send an OTP right now."),
      );
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
    const options = await mfaService.beginPasskeyRegistration(email);
    const credential = await createPasskeyCredential(options);

    await mfaService.finishPasskeyRegistration(email, credential);
    finishMfa();
  };

  const verifyPasskey = async () => {
    const options = await mfaService.beginPasskeyVerification(email);
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
      setError(
        getRequestErrorMessage(passkeyError, "Unable to check your passkeys."),
      );
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
      setError(
        getRequestErrorMessage(
          setupError,
          "Unable to load authenticator setup.",
        ),
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
      await passwordResetService.verifyOtp({ email, otp: code });
      finishMfa();
    } catch (verifyError) {
      setError(
        getRequestErrorMessage(verifyError, "Unable to verify this code."),
      );
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
      await mfaService.verifyCode({ email, code });
      finishMfa();
    } catch (verifyError) {
      setError(
        getRequestErrorMessage(
          verifyError,
          "Unable to verify this authenticator code.",
        ),
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
      await mfaService.verifyCode({ email, code: normalizedBackupCode });
      finishMfa();
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
      setError(
        getRequestErrorMessage(saveError, "Unable to save this authenticator."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    if (isLoading) {
      return <MfaLoadingStep />;
    }

    if (step === MFA_STEPS.AUTHENTICATOR) {
      return (
        <MfaAuthenticatorCodeStep
          code={code}
          isVerifying={isVerifying}
          onCodeChange={(value) => setCode(getDigits(value))}
          onVerify={handleVerifyAuthenticator}
          onUseBackupCode={() => {
            setBackupCode("");
            setError("");
            setStep(MFA_STEPS.BACKUP_CODE);
          }}
        />
      );
    }

    if (step === MFA_STEPS.BACKUP_CODE) {
      return (
        <MfaBackupCodeStep
          backupCode={backupCode}
          isVerifying={isVerifying}
          onBackupCodeChange={setBackupCode}
          onVerify={handleVerifyBackupCode}
        />
      );
    }

    if (step === MFA_STEPS.SETUP) {
      return (
        <MfaSetupQrStep
          qrCodeUrl={qrCodeUrl}
          isLoading={!qrCodeUrl && !error}
          onNext={handleOpenSetupConfirm}
        />
      );
    }

    if (step === MFA_STEPS.SETUP_CONFIRM) {
      return (
        <MfaSetupConfirmStep
          code={code}
          name={name}
          backupCodes={backupCodes}
          isSaving={isSaving}
          onCodeChange={(value) => setCode(getDigits(value))}
          onNameChange={setName}
          onSubmit={handleSaveAuthenticator}
          onBack={handleBackToSetupQr}
          onContinue={finishMfa}
        />
      );
    }

    return (
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
        onVerify={handleVerifyEmailOtp}
        isCancelling={isReturningToLogin}
        onCancel={onBackToLogin}
      />
    );
  };

  return (
    <div className="w-full max-w-[34.5rem] px-1 sm:px-0">
      <div className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex justify-center">
            <img src="/assets/images/IDP_Logo.png" alt="Identity Provider" className="h-20 w-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]" />
          </div>

          <div className="mb-5">
            <ErrorAlert message={error} onClose={() => setError("")} />
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
}
