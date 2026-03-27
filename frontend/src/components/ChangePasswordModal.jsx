import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import ChangePasswordStep, {
  getPasswordValidationState,
} from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import SuccessAlert from "./SuccessAlert";
import { getModalTheme } from "./modalTheme";

const stepMeta = {
  1: {
    title: "Change Password",
    description: "Secure your account with a new password",
    showCloseButton: true,
  },
  2: {
    title: "Verify Identity",
    description: "Enter the OTP sent to your email",
    showCloseButton: true,
  },
  3: {
    title: "Success!",
    description: "Password changed successfully",
    showCloseButton: false,
  },
};

function getDisabledPrimaryButtonClassName(isDarkMode) {
  return isDarkMode
    ? "cursor-not-allowed border-white/10 bg-white/[0.08] text-white/45 hover:border-white/10 hover:bg-white/[0.08]"
    : "cursor-not-allowed border-[#7b0d15]/12 bg-[#cdb7bb] text-white/70 hover:border-[#7b0d15]/12 hover:bg-[#cdb7bb]";
}

export default function ChangePasswordModal({ isOpen, onClose, showCurrentPassword = true, addAuditLog, setToastMessage, enableSuccessAlert = false, colorMode = "light" }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const passwordValidation = useMemo(
    () => getPasswordValidationState(form),
    [form],
  );

  useEffect(() => {
    if (step !== 2) {
      return;
    }

    setTimer(60);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((currentTimer) => {
        if (currentTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp(["", "", "", "", "", ""]);
      setSuccessMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 3) {
      return;
    }

    const message = "Password changed successfully!";

    if (setToastMessage) {
      setToastMessage(message);

      const hide = setTimeout(() => {
        setToastMessage("");
      }, 2500);

      return () => clearTimeout(hide);
    }

    if (enableSuccessAlert) {
      setSuccessMessage(message);

      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [step, setToastMessage, enableSuccessAlert]);

  const verifyOTP = () => {
    const code = otp.join("");

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return;
    }

    if (addAuditLog) {
      addAuditLog({
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        action: "PASSWORD_CHANGE",
        details: "Password changed successfully",
        color: "yellow",
      });
    }

    setStep(3);
  };

  if (!isOpen) {
    return null;
  }

  const currentStepMeta = stepMeta[step] || stepMeta[1];
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const passwordModalBoxClassName = `${modalBoxClassName} !max-w-2xl`;
  const requiredFieldsClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#8f6f76]";
  const getPrimaryButtonClassName = (isDisabled = false) =>
    `${modalPrimaryButtonClassName} ${
      isDisabled ? getDisabledPrimaryButtonClassName(isDarkMode) : ""
    }`;

  return (
    <>
      {createPortal(
        <dialog open className={modalOverlayClassName}>
          <div className={passwordModalBoxClassName}>
            <div className={modalHeaderClassName}>
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h3 className={modalHeaderTitleClassName}>
                    {currentStepMeta.title}
                  </h3>
                  <p className={modalHeaderDescriptionClassName}>
                    {currentStepMeta.description}
                  </p>
                </div>

                {currentStepMeta.showCloseButton && (
                  <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className={modalBodyClassName}>
              <div className={modalBodyStackClassName}>
                {step === 1 && (
                  <ChangePasswordStep
                    form={form}
                    setForm={setForm}
                    showCurrentPassword={showCurrentPassword}
                    colorMode={colorMode}
                  />
                )}

                {step === 2 && (
                  <OtpVerificationStep
                    otp={otp}
                    setOtp={setOtp}
                    timer={timer}
                    canResend={canResend}
                    onResend={() => setStep(1)}
                    onVerify={verifyOTP}
                    colorMode={colorMode}
                  />
                )}

                {step === 3 && <SuccessStep colorMode={colorMode} />}
              </div>
            </div>

            <div className={modalFooterClassName}>
              {step === 1 ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className={requiredFieldsClassName}>
                    <span className="text-red-500">*</span> Required fields
                  </div>
                  <div className={modalFooterActionsClassName}>
                    <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
                      Cancel
                    </button>
                    <button type="button" disabled={!passwordValidation.isValid}
                      className={getPrimaryButtonClassName(
                        !passwordValidation.isValid,
                      )}
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div className={modalFooterActionsClassName}>
                  {step === 2 && (
                    <button type="button" className={modalPrimaryButtonClassName} onClick={verifyOTP}>
                      Verify & Change Password
                    </button>
                  )}

                  {step === 3 && (
                    <button type="button" className={modalPrimaryButtonClassName} onClick={onClose}>
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </dialog>,
        document.body,
      )}

      {enableSuccessAlert && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </>
  );
}