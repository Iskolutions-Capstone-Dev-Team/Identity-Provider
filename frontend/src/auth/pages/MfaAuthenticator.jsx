import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consumeMfaReturnPath, rememberMfaVerified } from "../utils/mfaFlow";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

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
            "Unable to prepare authenticator verification.",
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

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }

    try {
      setIsVerifying(true);
      await mfaService.verifyCode({ email, code });
      rememberMfaVerified();
      navigate(consumeMfaReturnPath(), { replace: true });
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
          isVerifying={isVerifying}
          onCodeChange={(value) => setCode(getDigits(value))}
          onVerify={handleVerify}
        />
      )}
    </MfaShell>
  );
}