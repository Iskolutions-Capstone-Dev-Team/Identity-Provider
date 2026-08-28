import MfaCodeInput from "./MfaCodeInput";
import { Mail, Smartphone, KeySquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";

function MfaMethodButton({ label, icon, isActive, isLoading = false, loadingText = "Checking...", disabled = false, onClick }) {
  return (
    <Button variant="outline" type="button" className={`h-12 w-full flex items-center justify-center gap-2 rounded-xl transition duration-300 ${isActive ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-[#ffd700] hover:bg-[#ffd700]/20 hover:text-[#ffd700]" : "border-white/12 bg-white/6 text-white/70 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-[#ffd700]"}`} onClick={onClick} disabled={disabled || isLoading}>
      {icon}
      <span className="text-sm">{isLoading ? loadingText : label}</span>
    </Button>
  );
}

export default function MfaVerifyStep({ email, code, mode, hasSentOtp, isSendingOtp, cooldown = 0, isVerifying, isCheckingAuthenticators, isCheckingPasskey, isCancelling = false, onSelectEmail, onSelectAuthenticator, onSelectPasskey, onCodeChange, onSendOtp, onVerify, onCancel }) {
  const isEmailMode = mode === "email";
  const isAuthenticatorMode = mode === "authenticator";
  const isPasskeyMode = mode === "passkey";
  const shouldShowCodeInput = isAuthenticatorMode || hasSentOtp;
  const verifyLabel = isAuthenticatorMode
    ? "Verify Authenticator Code"
    : "Verify OTP";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Multi-Factor Authentication
        </h1>
        <p className="text-sm leading-6 text-white/75">
          Signed in as{" "}
          <span className="font-semibold text-white">
            {email || "your account"}
          </span>
        </p>
      </div>

      <form onSubmit={onVerify} className="space-y-4">
        <MfaMethodButton
          label="Email"
          icon={<Mail className="size-4" />}
          isActive={isEmailMode}
          onClick={onSelectEmail}
          disabled={cooldown > 0}
        />

        {isEmailMode && !hasSentOtp ? (
          <Button type="button" onClick={onSendOtp} disabled={isSendingOtp || !email || cooldown > 0} className="h-11 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300">
            {isSendingOtp ? "Sending..." : "Send OTP"}
          </Button>
        ) : null}

        {shouldShowCodeInput ? (
          <>
            <MfaCodeInput
              value={code}
              onChange={onCodeChange}
              disabled={isVerifying || cooldown > 0}
            />

            <Button type="submit" disabled={isVerifying || cooldown > 0} className="h-12 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300 mt-2">
              {isVerifying ? "Verifying..." : verifyLabel}
            </Button>
          </>
        ) : null}

        {isEmailMode && hasSentOtp ? null : null /* removed the resend button */}
      </form>

      <div className="flex items-center gap-4">
        <Separator className="flex-1 bg-white/20" />
        <span className="text-sm font-medium text-white/70">Or continue with</span>
        <Separator className="flex-1 bg-white/20" />
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className={`h-12 flex-1 flex items-center justify-center gap-2 rounded-xl transition duration-300 ${isAuthenticatorMode ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-[#ffd700] hover:bg-[#ffd700]/20 hover:text-[#ffd700]" : "border-white/12 bg-white/6 text-white/70 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-[#ffd700]"}`} onClick={onSelectAuthenticator} disabled={isCheckingAuthenticators || cooldown > 0}>
          <Smartphone className="size-4" />
          <span className="text-sm">Authenticator</span>
        </Button>

        <Button type="button" variant="outline" className={`h-12 flex-1 flex items-center justify-center gap-2 rounded-xl transition duration-300 ${isPasskeyMode ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-[#ffd700] hover:bg-[#ffd700]/20 hover:text-[#ffd700]" : "border-white/12 bg-white/6 text-white/70 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-[#ffd700]"}`} onClick={onSelectPasskey} disabled={isCheckingPasskey || cooldown > 0}>
          <KeySquare className="size-4" />
          <span className="text-sm">Passkey</span>
        </Button>
      </div>

      {onCancel ? (
        <Button variant="outline" type="button" onClick={onCancel} disabled={isCancelling} className="h-11 w-full bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white transition">
          {isCancelling ? "Signing out..." : "Back to login"}
        </Button>
      ) : null}
    </div>
  );
}