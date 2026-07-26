import MfaCodeInput from "./MfaCodeInput";
import { Mail, Smartphone, KeySquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";

function MfaMethodButton({ label, icon, isActive, isLoading = false, loadingText = "Checking...", disabled = false, onClick }) {
  return (
    <Button variant="outline" className={`group/button h-auto justify-start gap-4 px-4 py-3 text-left w-full transition duration-300 ${isActive ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-white hover:bg-[#ffd700]/20 hover:text-white" : "border-white/12 bg-white/6 text-white/80 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white"}`} onClick={onClick} disabled={disabled || isLoading}>
      <div className={`rounded-full flex size-10 shrink-0 items-center justify-center ${isActive ? "bg-[#ffd700]/20 text-[#ffd700]" : "bg-white/10 text-white/70 group-hover/button:bg-[#ffd700]/20 group-hover/button:text-[#ffd700]"}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="truncate font-semibold">{label}</span>
        {isLoading && (
          <span className="text-white/60 text-xs font-normal truncate">
            {loadingText}
          </span>
        )}
      </div>
    </Button>
  );
}

export default function MfaVerifyStep({ email, code, mode, hasSentOtp, isSendingOtp, isVerifying, isCheckingAuthenticators, isCheckingPasskey, isCancelling = false, onSelectEmail, onSelectAuthenticator, onSelectPasskey, onCodeChange, onSendOtp, onVerify, onCancel }) {
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
          icon={<Mail className="size-5" />}
          isActive={isEmailMode}
          onClick={onSelectEmail}
        />

        {isEmailMode && !hasSentOtp ? (
          <Button type="button" onClick={onSendOtp} disabled={isSendingOtp || !email} className="h-11 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300">
            {isSendingOtp ? "Sending..." : "Send OTP"}
          </Button>
        ) : null}

        {shouldShowCodeInput ? (
          <>
            <MfaCodeInput
              value={code}
              onChange={onCodeChange}
              disabled={isVerifying}
            />

            <Button type="submit" disabled={isVerifying} className="h-12 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300 mt-2">
              {isVerifying ? "Verifying..." : verifyLabel}
            </Button>
          </>
        ) : null}
      </form>

      <div className="flex items-center gap-4">
        <Separator className="flex-1 bg-white/20" />
        <span className="text-sm font-medium text-white/70">other verification methods</span>
        <Separator className="flex-1 bg-white/20" />
      </div>

      <div className="space-y-3">
        <MfaMethodButton
          label="Authenticator app"
          icon={<Smartphone className="size-5" />}
          isActive={isAuthenticatorMode}
          isLoading={isCheckingAuthenticators}
          disabled={isCheckingAuthenticators}
          onClick={onSelectAuthenticator}
        />

        <MfaMethodButton
          label="Passkey"
          icon={<KeySquare className="size-5" />}
          isActive={isPasskeyMode}
          isLoading={isCheckingPasskey}
          disabled={isCheckingPasskey}
          onClick={onSelectPasskey}
        />
      </div>

      {onCancel ? (
        <Button variant="outline" type="button" onClick={onCancel} disabled={isCancelling} className="h-11 w-full bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white transition">
          {isCancelling ? "Signing out..." : "Back to login"}
        </Button>
      ) : null}
    </div>
  );
}