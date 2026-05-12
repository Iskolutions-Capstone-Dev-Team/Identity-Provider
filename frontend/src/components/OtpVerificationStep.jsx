import { useEffect, useRef } from "react";
import ErrorAlert from "./ErrorAlert";
import { getModalTheme } from "./modalTheme";

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function OtpVerificationStep({ otp, setOtp, timer, canResend, onResend, errorMessage = "", onClearError, emailAddress = "your email address", colorMode = "light" }) {
  const inputsRef = useRef([]);
  const { modalSectionClassName } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const hasError = Boolean(errorMessage);
  const iconWrapClassName = isDarkMode
    ? "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-200 transition-[background-color,color] duration-500 ease-out"
    : "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-[background-color,color] duration-500 ease-out";
  const headingClassName = isDarkMode
    ? "text-lg font-semibold text-[#f6eaec] transition-colors duration-500 ease-out"
    : "text-lg font-semibold text-[#351018] transition-colors duration-500 ease-out";
  const bodyTextClassName = isDarkMode
    ? "mt-2 text-sm text-[#d6c3c7] transition-colors duration-500 ease-out"
    : "mt-2 text-sm text-[#6f4f56] transition-colors duration-500 ease-out";
  const emailClassName = isDarkMode
    ? "mt-1 block font-medium text-[#ffe28a] transition-colors duration-500 ease-out"
    : "mt-1 block font-medium text-[#7b0d15] transition-colors duration-500 ease-out";
  const noteClassName = isDarkMode
    ? "mt-2 text-sm text-[#c7adb4] transition-colors duration-500 ease-out"
    : "mt-2 text-sm text-[#8f6f76] transition-colors duration-500 ease-out";
  const otpInputClassName = isDarkMode
    ? "h-14 w-12 rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.78),rgba(22,28,40,0.88))] text-center text-xl font-bold text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition duration-300 focus:border-[#f8d24e]/55 focus:ring-4 focus:ring-[#f8d24e]/15 sm:w-14"
    : "h-14 w-12 rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] text-center text-xl font-bold text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition duration-300 focus:border-[#d4a017] focus:ring-4 focus:ring-[#f8d24e]/20 sm:w-14";
  const otpInputErrorClassName = hasError
    ? isDarkMode
      ? "border-red-400/55 focus:border-red-400 focus:ring-red-500/15"
      : "border-red-300 focus:border-red-400 focus:ring-red-200/70"
    : "";
  const hintClassName = isDarkMode
    ? "text-sm text-[#c7adb4] transition-colors duration-500 ease-out"
    : "text-sm text-[#8f6f76] transition-colors duration-500 ease-out";
  const errorTextClassName = isDarkMode
    ? "mt-2 text-sm text-red-200"
    : "mt-2 text-sm text-red-600";
  const resendBoxClassName = isDarkMode
    ? "rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.72)] px-4 py-4 text-center transition-[background-color,border-color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#7b0d15]/10 bg-[#fffaf2] px-4 py-4 text-center transition-[background-color,border-color] duration-500 ease-out";
  const resendPromptClassName = isDarkMode
    ? "text-sm text-[#d6c3c7] transition-colors duration-500 ease-out"
    : "text-sm text-[#6f4f56] transition-colors duration-500 ease-out";
  const resendButtonClassName = canResend
    ? isDarkMode
      ? "mt-1 text-sm font-medium text-[#ffe28a] transition-colors duration-300 hover:text-[#fff1bf]"
      : "mt-1 text-sm font-medium text-[#7b0d15] transition-colors duration-300 hover:text-[#5a0b12]"
    : "mt-1 cursor-not-allowed text-sm font-medium text-gray-400";
  const timerClassName = isDarkMode
    ? "font-mono text-[#ffe28a] transition-colors duration-500 ease-out"
    : "font-mono text-[#7b0d15] transition-colors duration-500 ease-out";

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="space-y-5">
      <ErrorAlert
        message={errorMessage}
        onClose={onClearError}
        autoHideDuration={2500}
      />

      <section className={`${modalSectionClassName} text-center`}>
        <div className={iconWrapClassName}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
          </svg>
        </div>

        <h4 className={headingClassName}>Check Your Email</h4>
        <p className={bodyTextClassName}>
          We've sent a 6-digit verification code to
          <span className={emailClassName}>{emailAddress}</span>
        </p>
        <p className={noteClassName}>The code will expire in 3 minutes</p>
      </section>

      <section className={modalSectionClassName}>
        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-4 flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className={`${otpInputClassName} ${otpInputErrorClassName}`}
                  maxLength={1}
                />
              ))}
            </div>
            <p className={hintClassName}>Enter the 6-digit code</p>
            {hasError ? <p className={errorTextClassName}>{errorMessage}</p> : null}
          </div>

          <div className={resendBoxClassName}>
            <p className={resendPromptClassName}>Didn't receive the code?</p>
            <button type="button" disabled={!canResend} onClick={onResend} className={resendButtonClassName}>
              Resend OTP
            </button>
            <p className={noteClassName}>
              Resend available in <span className={timerClassName}>
                {formatTimer(timer)}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
