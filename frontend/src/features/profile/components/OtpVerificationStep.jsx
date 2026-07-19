import { useEffect, useRef } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../../components/ui/input-otp";

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function OtpVerificationStep({ otp, setOtp, timer, canResend, onResend, errorMessage = "", onClearError, emailAddress = "your email address", colorMode = "light" }) {
  const hasError = Boolean(errorMessage);

  const handleOtpChange = (val) => {
    const newOtp = val.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);
    if (errorMessage) {
      onClearError?.();
    }
  };

  return (
    <div className="space-y-4">
      <ErrorAlert
        message={errorMessage}
        onClose={onClearError}
        autoHideDuration={2500}
      />

      <Card className="shadow-none border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Mail className="size-8" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2 space-y-6">
          <p className="text-sm text-muted-foreground text-center text-balance mx-auto sm:px-4">
            Enter the verification code we sent to your email address: <strong className="text-foreground">{emailAddress}</strong>.
          </p>

          <div>
            <div className="flex flex-col items-center">
              <div className="w-fit">
                <div className="mb-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Verification code
                  </label>
                </div>
                <InputOTP id="otp" maxLength={6} value={otp.join("")} onChange={handleOtpChange}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                    <InputOTPSlot index={1} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                    <InputOTPSlot index={2} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                    <InputOTPSlot index={4} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                    <InputOTPSlot index={5} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant={canResend ? "default" : "secondary"} size="sm" onClick={onResend} disabled={!canResend} className={canResend ? "bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-white dark:text-black dark:hover:bg-white/90" : ""}>
                <RefreshCw className="size-3.5 mr-2" /> Resend Code
              </Button>
              <span className="text-sm text-muted-foreground font-mono">{formatTimer(timer)}</span>
            </div>

            {hasError && <p className="text-sm text-destructive mt-4 text-center">{errorMessage}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}