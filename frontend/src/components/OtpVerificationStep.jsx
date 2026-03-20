import { useEffect, useRef } from "react";
import { modalSectionClassName } from "./modalTheme";

export default function OtpVerificationStep({ otp, setOtp, timer, canResend, onResend, onVerify }) {
  const inputsRef = useRef([]);

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

    if (updatedOtp.join("").length === 6) {
      onVerify();
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
      <section className={`${modalSectionClassName} text-center`}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
          </svg>
        </div>

        <h4 className="text-lg font-semibold text-[#351018]">Check Your Email</h4>
        <p className="mt-2 text-sm text-[#6f4f56]">
          We've sent a 6-digit verification code to
          <span className="mt-1 block font-medium text-[#7b0d15]">
            juan.delacruz@iskolarngbayan.pup.edu.ph
          </span>
        </p>
        <p className="mt-2 text-sm text-[#8f6f76]">
          The code will expire in 10 minutes
        </p>
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
                  className="h-14 w-12 rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] text-center text-xl font-bold text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-[#f8d24e]/20 sm:w-14"
                  maxLength={1}
                />
              ))}
            </div>
            <p className="text-sm text-[#8f6f76]">Enter the 6-digit code</p>
          </div>

          <div className="hidden rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
              </svg>
              <span className="text-sm">Invalid OTP code</span>
            </div>
          </div>

          <div className="rounded-[1rem] border border-[#7b0d15]/10 bg-[#fffaf2] px-4 py-4 text-center">
            <p className="text-sm text-[#6f4f56]">Didn't receive the code?</p>
            <button type="button" disabled={!canResend} onClick={onResend}
              className={`mt-1 text-sm font-medium ${
                canResend
                  ? "text-[#7b0d15] hover:text-[#5a0b12]"
                  : "cursor-not-allowed text-gray-400"
              }`}
            >
              Resend OTP
            </button>
            <p className="mt-2 text-xs text-[#8f6f76]">
              Resend available in{" "}
              <span className="font-mono text-[#7b0d15]">
                00:{String(timer).padStart(2, "0")}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}