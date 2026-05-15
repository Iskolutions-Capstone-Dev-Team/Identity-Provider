import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearMfaSetup, consumeMfaReturnPath, getMfaSetup, MFA_SETUP_PATH, rememberMfaVerified } from "../utils/mfaFlow";
import { mfaService } from "../../services/mfaService";
import ErrorAlert from "../../components/ErrorAlert";
import MfaSetupConfirmStep from "../components/mfa/MfaSetupConfirmStep";
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

export default function MfaSetupConfirm() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState({ email: "", secret: "", otpAuthUri: "" });
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedSetup = getMfaSetup();

    if (!storedSetup.secret) {
      navigate(MFA_SETUP_PATH, { replace: true });
      return;
    }

    setSetup(storedSetup);
  }, [navigate]);

  const finishMfa = () => {
    clearMfaSetup();
    rememberMfaVerified();
    navigate(consumeMfaReturnPath(), { replace: true });
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
        getRequestErrorMessage(
          saveError,
          "Unable to save this authenticator.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MfaShell>
      <div className="mb-5">
        <ErrorAlert message={error} onClose={() => setError("")} />
      </div>

      <MfaSetupConfirmStep
        code={code}
        name={name}
        backupCodes={backupCodes}
        isSaving={isSaving}
        onCodeChange={(value) => setCode(getDigits(value))}
        onNameChange={setName}
        onSubmit={handleSaveAuthenticator}
        onContinue={finishMfa}
      />
    </MfaShell>
  );
}