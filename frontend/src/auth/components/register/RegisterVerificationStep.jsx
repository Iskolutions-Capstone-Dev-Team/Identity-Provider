import { FieldError, FormLabel, RegisterSubmitButton } from "./registerUi";

export default function RegisterVerificationStep({ code, error, inputsRef, isResending, isVerifying, resendTimer, onChange, onKeyDown, onPaste, onResend, onSubmit }) {
  const canResend = resendTimer <= 0 && !isResending;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <FormLabel>Enter Verification Code</FormLabel>
        <div className="grid grid-cols-6 gap-2" onPaste={onPaste}>
          {code.map((digit, index) => (
            <input key={index} ref={(element) => {
                inputsRef.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => onChange(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(index, event)}
              className={`h-14 min-w-0 rounded-2xl border bg-white/95 text-center text-xl font-semibold text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 focus:ring-4 ${
                error
                  ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                  : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
              }`}
            />
          ))}
        </div>
        <FieldError message={error} />
      </div>

      <p className="text-center text-sm text-white/80">
        Didn&apos;t receive a code?{" "}
        <button type="button" onClick={onResend} disabled={!canResend}
          className={`font-semibold underline decoration-transparent transition duration-300 ${
            canResend
              ? "text-[#ffd700] hover:decoration-[#ffd700]"
              : "cursor-not-allowed text-white/45"
          }`}
        >
          {isResending ? "Resending" : "Resend"}
        </button>{" "}
        {resendTimer > 0 ? `in ${resendTimer}s` : "now"}
      </p>

      <RegisterSubmitButton disabled={isVerifying} compactTracking>
        {isVerifying ? "VERIFYING OTP..." : "VERIFY & CONTINUE"}
      </RegisterSubmitButton>
    </form>
  );
}