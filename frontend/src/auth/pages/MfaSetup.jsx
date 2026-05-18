import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { MFA_SETUP_CONFIRM_PATH, rememberMfaSetup } from "../utils/mfaFlow";
import { mfaService } from "../../services/mfaService";
import { userService } from "../../services/userService";
import ErrorAlert from "../../components/ErrorAlert";
import MfaLoadingStep from "../components/mfa/MfaLoadingStep";
import MfaSetupQrStep from "../components/mfa/MfaSetupQrStep";
import MfaShell from "../components/mfa/MfaShell";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function MfaSetup() {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSetup() {
      try {
        const currentUser = await userService.getMe();
        const email = currentUser?.email || "";
        const setup = await mfaService.getSetup(email);
        const nextQrCodeUrl = await QRCode.toDataURL(setup.otpAuthUri, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
        });

        if (!isMounted) {
          return;
        }

        rememberMfaSetup({
          ...setup,
          email,
        });
        setQrCodeUrl(nextQrCodeUrl);
      } catch (setupError) {
        if (!isMounted) {
          return;
        }

        setError(
          getRequestErrorMessage(
            setupError,
            "Unable to load authenticator setup.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSetup();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MfaShell>
      <div className="mb-5">
        <ErrorAlert message={error} onClose={() => setError("")} />
      </div>

      {isLoading ? (
        <MfaLoadingStep />
      ) : (
        <MfaSetupQrStep
          qrCodeUrl={qrCodeUrl}
          isLoading={isLoading}
          onNext={() => navigate(MFA_SETUP_CONFIRM_PATH)}
        />
      )}
    </MfaShell>
  );
}