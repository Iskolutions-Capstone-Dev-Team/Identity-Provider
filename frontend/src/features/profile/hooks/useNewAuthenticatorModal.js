import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { createPasskeyCredential } from "../../../auth/utils/webAuthn";
import { mfaService } from "../../../services/mfaService";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export function useNewAuthenticatorModal({ open, email, onClose, onCreated }) {
  const [connectionType, setConnectionType] = useState("");
  const [step, setStep] = useState("choice");
  const [setup, setSetup] = useState({ secret: "", otpAuthUri: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [hasCopiedBackupCodes, setHasCopiedBackupCodes] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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

  useEffect(() => {
    if (open) {
      setConnectionType("");
      setStep("choice");
      setSetup({ secret: "", otpAuthUri: "" });
      setQrCodeUrl("");
      setCode("");
      setName("");
      setBackupCodes([]);
      setHasCopiedBackupCodes(false);
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
          if (setupError?.response?.status === 429) {
            setCooldown(12);
            setError(`Too many attempts. Please wait.`);
            setStep("choice");
            setConnectionType("");
          } else {
            setError(
              getRequestErrorMessage(
                setupError,
                "Unable to load authenticator setup.",
              ),
            );
          }
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
      toast.success("Passkey added successfully");
      onClose?.();
    } catch (passkeyError) {
      if (passkeyError?.response?.status === 429) {
        setCooldown(12);
        setError("Too many attempts. Please wait.");
      } else {
        setError(
          getRequestErrorMessage(passkeyError, "Unable to connect this passkey."),
        );
      }
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleSaveAuthenticator = async (event) => {
    event?.preventDefault?.();
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
      setHasCopiedBackupCodes(false);
    } catch (saveError) {
      setError(
        getRequestErrorMessage(saveError, "Unable to save this authenticator."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    onCreated?.({ type: "authenticator", code });
    toast.success("Authenticator app added successfully");
    onClose?.();
  };

  return {
    connectionType,
    step,
    setStep,
    setup,
    qrCodeUrl,
    code,
    setCode,
    name,
    setName,
    backupCodes,
    hasCopiedBackupCodes,
    setHasCopiedBackupCodes,
    error,
    setError,
    isSaving,
    isRegisteringPasskey,
    cooldown,
    handleSelectAuthenticator,
    handleSelectPasskey,
    handleSaveAuthenticator,
    handleFinish,
  };
}
