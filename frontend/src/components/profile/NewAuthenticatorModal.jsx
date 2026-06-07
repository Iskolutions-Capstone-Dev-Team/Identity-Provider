import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import ErrorAlert from "../ErrorAlert";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";
import MfaSetupConfirmStep from "../../auth/components/mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "../../auth/components/mfa/MfaSetupQrStep";
import { getDigits } from "../../auth/components/mfa/mfaInputUtils";
import { createPasskeyCredential } from "../../auth/utils/webAuthn";
import { mfaService } from "../../services/mfaService";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function AuthenticatorSetupIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function ConnectionSetupIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function PasskeySetupIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

function ConnectionOptionButton({ title, description, icon, colorMode, onClick, disabled }) {
  const isDarkMode = colorMode === "dark";
  const buttonClassName = isDarkMode
    ? "group flex min-h-[5.5rem] w-full items-center gap-4 rounded-[1.25rem] border border-white/12 bg-white/[0.04] px-5 py-4 text-left transition hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/10 disabled:cursor-not-allowed disabled:opacity-60"
    : "group flex min-h-[5.5rem] w-full items-center gap-4 rounded-[1.25rem] border border-[#7b0d15]/12 bg-[#fffaf2] px-5 py-4 text-left shadow-[0_18px_36px_-32px_rgba(43,3,7,0.5)] transition hover:border-[#f8d24e]/80 hover:bg-[#fff4dc] disabled:cursor-not-allowed disabled:opacity-60";
  const iconClassName = isDarkMode
    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[#f8d24e]/35 bg-[#f8d24e]/10 text-[#ffe28a]"
    : "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[#f8d24e]/55 bg-[#f8d24e]/18 text-[#7b0d15]";
  const titleClassName = isDarkMode
    ? "block text-base font-bold text-white"
    : "block text-base font-bold text-[#351018]";
  const descriptionClassName = isDarkMode
    ? "mt-1 block text-sm font-semibold leading-5 text-[#d8c6cc]"
    : "mt-1 block text-sm font-semibold leading-5 text-[#7b5560]";

  return (
    <button type="button" className={buttonClassName} onClick={onClick} disabled={disabled}>
      <span className={iconClassName}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={titleClassName}>{title}</span>
        <span className={descriptionClassName}>{description}</span>
      </span>
    </button>
  );
}

export default function NewAuthenticatorModal({ open, email, onClose, onCreated, colorMode = "light" }) {
  const [connectionType, setConnectionType] = useState("");
  const [step, setStep] = useState("choice");
  const [setup, setSetup] = useState({ secret: "", otpAuthUri: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const { shouldRender, isClosing } = useModalTransition(open);
  const {
    modalBodyClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
  } = getModalTheme(colorMode);
  const headerIconClassName =
    colorMode === "dark" ? "h-10 w-10 text-[#ffe28a]" : "h-10 w-10 text-[#fff0a8]";
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const setupBodyClassName = colorMode === "dark"
    ? "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(35,38,48,0.96),rgba(27,29,38,0.96))] p-5 text-white shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] sm:p-6"
    : "rounded-[1.5rem] border border-[#7b0d15]/10 bg-[#fffaf2] p-5 text-[#351018] shadow-[0_22px_45px_-36px_rgba(43,3,7,0.45)] sm:p-6";

  useEffect(() => {
    if (open) {
      setConnectionType("");
      setStep("choice");
      setSetup({ secret: "", otpAuthUri: "" });
      setQrCodeUrl("");
      setCode("");
      setName("");
      setBackupCodes([]);
      setError("");
      setIsSaving(false);
      setIsRegisteringPasskey(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || connectionType !== "authenticator") {
      return undefined;
    }

    let isCancelled = false;

    const loadSetup = async () => {
      try {
        const nextSetup = await mfaService.getSetup(email);
        const nextQrCodeUrl = await QRCode.toDataURL(nextSetup.otpAuthUri, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
        });

        if (!isCancelled) {
          setSetup(nextSetup);
          setQrCodeUrl(nextQrCodeUrl);
        }
      } catch (setupError) {
        if (!isCancelled) {
          setError(
            getRequestErrorMessage(
              setupError,
              "Unable to load authenticator setup.",
            ),
          );
        }
      }
    };

    loadSetup();

    return () => {
      isCancelled = true;
    };
  }, [connectionType, email, open]);

  const handleSelectAuthenticator = () => {
    setConnectionType("authenticator");
    setStep("qr");
    setError("");
  };

  const handleSelectPasskey = async () => {
    setConnectionType("passkey");
    setError("");

    try {
      setIsRegisteringPasskey(true);
      const options = await mfaService.beginPasskeyRegistration(email);
      const credential = await createPasskeyCredential(options);

      await mfaService.finishPasskeyRegistration(email, credential);
      onCreated?.({ type: "passkey" });
      onClose?.();
    } catch (passkeyError) {
      setError(
        getRequestErrorMessage(passkeyError, "Unable to connect this passkey."),
      );
    } finally {
      setIsRegisteringPasskey(false);
    }
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
        email,
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

  const handleFinish = () => {
    onCreated?.({ type: "authenticator" });
    onClose?.();
  };

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={`${modalBoxClassName} !max-w-xl`}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16">
              {connectionType === "passkey" ? (
                <PasskeySetupIcon className={headerIconClassName} />
              ) : connectionType === "authenticator" ? (
                <AuthenticatorSetupIcon className={headerIconClassName} />
              ) : (
                <ConnectionSetupIcon className={headerIconClassName} />
              )}
              <h3 className={modalHeaderTitleClassName}>
                {connectionType === "authenticator"
                  ? "New Authenticator"
                  : connectionType === "passkey"
                    ? "New Passkey"
                    : "New Connection"}
              </h3>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className="space-y-5">
            <ErrorAlert message={error} onClose={() => setError("")} />

            {step === "choice" ? (
              <div className="space-y-4">
                <ConnectionOptionButton
                  title="Authenticator App"
                  description="Scan a QR code and verify a 6-digit code."
                  icon={<AuthenticatorSetupIcon className="h-6 w-6" />}
                  colorMode={colorMode}
                  onClick={handleSelectAuthenticator}
                  disabled={isRegisteringPasskey}
                />
                <ConnectionOptionButton
                  title="Passkey"
                  description="Use your device, browser, or security key."
                  icon={<PasskeySetupIcon className="h-6 w-6" />}
                  colorMode={colorMode}
                  onClick={handleSelectPasskey}
                  disabled={isRegisteringPasskey}
                />
              </div>
            ) : (
              <div className={setupBodyClassName}>
                {step === "qr" ? (
                <MfaSetupQrStep
                  qrCodeUrl={qrCodeUrl}
                  isLoading={!qrCodeUrl && !error}
                  colorMode={colorMode}
                  onNext={() => {
                    setCode("");
                    setError("");
                    setStep("confirm");
                  }}
                />
              ) : (
                <MfaSetupConfirmStep
                  code={code}
                  name={name}
                  backupCodes={backupCodes}
                  isSaving={isSaving}
                  colorMode={colorMode}
                  onCodeChange={(value) => setCode(getDigits(value))}
                  onNameChange={setName}
                  onSubmit={handleSaveAuthenticator}
                  onBack={() => {
                    setCode("");
                    setError("");
                    setStep("qr");
                  }}
                  onContinue={handleFinish}
                />
              )}
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
