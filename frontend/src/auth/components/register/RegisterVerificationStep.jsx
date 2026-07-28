import { Button } from "../../../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../../components/ui/input-otp";
import { RefreshCw } from "lucide-react";

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function RegisterVerificationStep({ code, error, isResending, isVerifying, resendTimer, onChange, onResend, onSubmit }) {
  const canResend = resendTimer <= 0 && !isResending;

  const handleOtpChange = (val) => {
    onChange(val);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-fit">
          <div className="mb-2">
            <label className="text-sm font-medium leading-none text-white/90">
              Verification code
            </label>
          </div>
          
          <InputOTP id="verification-code" maxLength={6} value={code.join("")} onChange={handleOtpChange} autoFocus>
            <InputOTPGroup>
              {[0, 1, 2].map((index) => (
                <InputOTPSlot 
                  key={index} 
                  index={index} 
                  className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800 ${
                    error ? "border-destructive focus-visible:ring-destructive focus-visible:ring-4" : ""
                  }`}
                />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator className="text-white/80" />
            <InputOTPGroup>
              {[3, 4, 5].map((index) => (
                <InputOTPSlot 
                  key={index} 
                  index={index} 
                  className={`w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800 ${
                    error ? "border-destructive focus-visible:ring-destructive focus-visible:ring-4" : ""
                  }`}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error ? (
          <p className="mt-3 text-center text-sm font-medium text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onResend} disabled={!canResend || isResending} className="bg-white/10 text-white hover:bg-white/20 border border-white/15">
          <RefreshCw className={`size-3.5 mr-2 ${isResending ? "animate-spin" : ""}`} /> 
          {isResending ? "Resending" : "Resend Code"}
        </Button>
        <span className="text-sm text-white/80 font-mono">
          {resendTimer > 0 ? formatTimer(resendTimer) : "00:00"}
        </span>
      </div>

      <Button type="submit" disabled={isVerifying} className="mt-2 h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300">
        {isVerifying ? "VERIFYING OTP..." : "VERIFY & CONTINUE"}
      </Button>
    </form>
  );
}