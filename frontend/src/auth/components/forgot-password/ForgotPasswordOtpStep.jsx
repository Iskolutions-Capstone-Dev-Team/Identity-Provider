import { useEffect, useRef } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { MailIcon } from "./ForgotPasswordIcons";
import { formatTimer } from "./forgotPasswordUtils";

export default function ForgotPasswordOtpStep({ otp, setOtp, timer, canResend, onResend, errorMessage, onClearError, emailAddress }) {
  const inputsRef = useRef([]);
  const hasError = Boolean(errorMessage);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return;
    }

    const updatedOtp = [...otp];
    digits.split("").forEach((digit, offset) => {
      const nextIndex = index + offset;

      if (nextIndex < updatedOtp.length) {
        updatedOtp[nextIndex] = digit;
      }
    });

    setOtp(updatedOtp);

    const nextFocusIndex = Math.min(index + digits.length, otp.length - 1);
    inputsRef.current[nextFocusIndex]?.focus();
    inputsRef.current[nextFocusIndex]?.select();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const updatedOtp = [...otp];

      if (updatedOtp[index]) {
        updatedOtp[index] = "";
        setOtp(updatedOtp);
        return;
      }

      if (index > 0) {
        updatedOtp[index - 1] = "";
        setOtp(updatedOtp);
        inputsRef.current[index - 1]?.focus();
        inputsRef.current[index - 1]?.select();
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      const updatedOtp = [...otp];
      updatedOtp[index] = "";
      setOtp(updatedOtp);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
      inputsRef.current[index - 1]?.select();
      return;
    }

    if (event.key === "ArrowRight" && index < otp.length - 1) {
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

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} autoHideDuration={2500} />

      <section className="rounded-2xl border border-[#7b0d15]/10 bg-white p-5 text-center shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#f8d24e]/40 bg-[#fff4dc] text-[#7b0d15]">
          <MailIcon className="h-8 w-8" />
        </div>
        <h4 className="text-lg font-semibold text-[#351018]">Check Your Email</h4>
        <p className="mt-2 text-sm text-[#6f4f56]">
          We've sent a 6-digit verification code to
          <span className="mt-1 block break-all font-medium text-[#7b0d15]">{emailAddress}</span>
        </p>
        <p className="mt-2 text-sm text-[#8f6f76]">The code will expire in 3 minutes</p>
      </section>

      <section className="rounded-2xl border border-[#7b0d15]/10 bg-white p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
        <div className="text-center">
          <div className="mb-4 flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                className={`h-14 w-11 rounded-xl border bg-white/95 text-center text-xl font-bold text-[#4a1921] outline-none transition duration-200 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 sm:w-14 ${
                  hasError ? "border-red-300 focus:border-red-300 focus:ring-red-200/70" : "border-[#d8b3ba]"
                }`}
                maxLength={1}
              />
            ))}
          </div>
          <p className="text-sm text-[#8f6f76]">Enter the 6-digit code</p>
          {hasError ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
        </div>

        <div className="mt-5 rounded-xl border border-[#7b0d15]/10 bg-[#fffaf2] px-4 py-4 text-center">
          <p className="text-sm text-[#6f4f56]">Didn't receive the code?</p>
          <button type="button" disabled={!canResend} onClick={onResend} className={canResend ? "mt-1 text-sm font-semibold text-[#7b0d15] transition hover:text-[#5a0b12]" : "mt-1 cursor-not-allowed text-sm font-semibold text-gray-400"}>
            Resend OTP
          </button>
          <p className="mt-1 text-sm text-[#8f6f76]">
            Resend available in <span className="font-mono text-[#7b0d15]">{formatTimer(timer)}</span>
          </p>
        </div>
      </section>
    </div>
  );
}