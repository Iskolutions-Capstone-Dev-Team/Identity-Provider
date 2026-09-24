import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { MFA_SETUP_CONFIRM_PATH, rememberMfaSetup } from "../utils/mfaFlow";
import { mfaService } from "../../services/mfaService";
import { userService } from "../../services/userService";
import ErrorAlert from "../../components/ErrorAlert";
import InfoAlert from "../../components/InfoAlert";
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
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleFlowError = (errorObj, defaultMessage) => {
    const message = getRequestErrorMessage(errorObj, defaultMessage);
    if (message.toLowerCase().includes("pending cookie missing")) {
      setError("");
      setInfo("Session expired. Redirecting to login form, kindly login again.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3500);
    } else {
      setInfo("");
      setError(message);
    }
  };

  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUserMfaSetup'],
    queryFn: () => userService.getMe(),
    retry: false
  });

  const { data: setupData, isLoading: isSetupLoading, isError: isSetupError, error: setupErrorObj } = useQuery({
    queryKey: ['mfaSetup', currentUser?.email],
    queryFn: async () => {
      const email = currentUser.email;
      const setup = await mfaService.getSetup(email);
      const nextQrCodeUrl = await QRCode.toDataURL(setup.otpAuthUri, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });

      return { setup, nextQrCodeUrl, email };
    },
    enabled: !!currentUser?.email,
    retry: false
  });

  useEffect(() => {
    if (setupData) {
      rememberMfaSetup({
        ...setupData.setup,
        email: setupData.email,
      });
    }
  }, [setupData]);

  useEffect(() => {
    if (isSetupError && setupErrorObj) {
      handleFlowError(setupErrorObj, "Unable to load authenticator setup.");
    }
  }, [isSetupError, setupErrorObj]);

  const isLoading = isUserLoading || isSetupLoading || (!!currentUser && !setupData && !isSetupError);

  return (
    <MfaShell>
      <div className="mb-5 space-y-3">
        <ErrorAlert message={error} onClose={() => setError("")} />
        <InfoAlert message={info} onClose={() => setInfo("")} />
      </div>

      {isLoading ? (
        <MfaLoadingStep />
      ) : (
        <MfaSetupQrStep
          qrCodeUrl={setupData?.nextQrCodeUrl || ""}
          isLoading={isLoading}
          onNext={() => navigate(MFA_SETUP_CONFIRM_PATH)}
        />
      )}
    </MfaShell>
  );
}