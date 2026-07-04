import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getModalTheme } from "../../../components/modalTheme";
import { getModalTransitionClassName } from "../../../components/modalTransition";
import ErrorAlert from "../../../components/ErrorAlert";
import InfoAlert from "../../../components/InfoAlert";
import { AuthenticatorIcon } from "../../../auth/components/mfa/mfaIcons";

export default function UserPoolMfaModal({ open, code, onCodeChange, onVerify, onCancel, isVerifying = false, error = "", colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const {
    modalBoxClassName,
    modalOverlayClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalBodyClassName,
    modalSectionClassName,
    modalFooterClassName,
    modalFooterActionsClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
  } = getModalTheme(colorMode);

  const bodyTextClassName = isDarkMode
    ? "text-sm text-[#d6c3c7] transition-colors duration-500 ease-out"
    : "text-sm text-[#6f4f56] transition-colors duration-500 ease-out";

  const hintClassName = isDarkMode
    ? "text-sm text-[#c7adb4] transition-colors duration-500 ease-out mt-5"
    : "text-sm text-[#8f6f76] transition-colors duration-500 ease-out mt-5";

  const otpInputClassName = isDarkMode
    ? "h-12 w-10 sm:h-14 sm:w-14 rounded-[0.8rem] sm:rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.78),rgba(22,28,40,0.88))] text-center text-lg sm:text-xl font-bold text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition duration-300 focus:border-[#f8d24e]/55 focus:ring-4 focus:ring-[#f8d24e]/15"
    : "h-12 w-10 sm:h-14 sm:w-14 rounded-[0.8rem] sm:rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] text-center text-lg sm:text-xl font-bold text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition duration-300 focus:border-[#d4a017] focus:ring-4 focus:ring-[#f8d24e]/20";

  const inputsRef = useRef([]);
  const codeArray = code.split("").concat(Array(6).fill("")).slice(0, 6);

  useEffect(() => {
    if (open) {
      inputsRef.current[0]?.focus();
    }
  }, [open]);

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return;
    }

    const updatedOtp = [...codeArray];
    digits.split("").forEach((digit, offset) => {
      const nextIndex = index + offset;
      if (nextIndex < 6) {
        updatedOtp[nextIndex] = digit;
      }
    });

    onCodeChange(updatedOtp.join(""));

    const nextFocusIndex = Math.min(index + digits.length, 5);
    inputsRef.current[nextFocusIndex]?.focus();
    inputsRef.current[nextFocusIndex]?.select();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const updatedOtp = [...codeArray];

      if (updatedOtp[index]) {
        updatedOtp[index] = "";
        onCodeChange(updatedOtp.join(""));
        return;
      }

      if (index > 0) {
        updatedOtp[index - 1] = "";
        onCodeChange(updatedOtp.join(""));
        inputsRef.current[index - 1]?.focus();
        inputsRef.current[index - 1]?.select();
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      const updatedOtp = [...codeArray];
      updatedOtp[index] = "";
      onCodeChange(updatedOtp.join(""));
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
      inputsRef.current[index - 1]?.select();
      return;
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select();
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) {
      handleChange(index, digits);
    }
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, false)}>
      <div className={`${modalBoxClassName} !max-w-lg`}>
        <div className={`${modalHeaderClassName} !px-7 !py-0 h-[7rem] sm:!px-8 flex items-center`}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6 w-full">
            <div className="flex min-w-0 flex-1 items-center gap-3 pr-3 sm:pr-12">
              <div className="shrink-0 text-[#f8d24e] [&>svg]:h-9 [&>svg]:w-9">
                <AuthenticatorIcon />
              </div>
              <h3 className={`${modalHeaderTitleClassName} !text-[1.35rem] leading-tight whitespace-nowrap`}>
                Verification Required
              </h3>
            </div>
          </div>
        </div>

        <form id="user-pool-mfa-form" className={modalBodyClassName}
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) {
              onVerify();
            }
          }}
        >
          <div className="space-y-5 py-4">
            {error && <ErrorAlert message={error} />}

            <InfoAlert 
              colorMode={colorMode} 
              message="For your security, administrative changes to account types or roles require MFA verification." 
            />

            <section className={modalSectionClassName}>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-4 flex items-center justify-center gap-2 sm:gap-3">
                    {codeArray.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(index, e)}
                        disabled={isVerifying}
                        className={otpInputClassName}
                      />
                    ))}
                  </div>
                  <p className={hintClassName}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className="flex w-full sm:justify-end">
            <div className={`${modalFooterActionsClassName} w-full sm:w-auto flex-col-reverse sm:flex-row`}>
              <button type="button" className={`${modalSecondaryButtonClassName} w-full sm:w-auto`} onClick={onCancel} disabled={isVerifying}>
                Cancel
              </button>

              <button form="user-pool-mfa-form" type="submit" className={`${modalPrimaryButtonClassName} w-full sm:w-auto`} disabled={isVerifying || code.length < 6}>
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
