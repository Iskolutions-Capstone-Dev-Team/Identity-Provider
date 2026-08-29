import MfaCodeInput from "./MfaCodeInput";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MfaAuthenticatorCodeStep({ code, cooldown = 0, isVerifying, onCodeChange, onVerify, onUseBackupCode, onBack }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Authenticator Code
        </h1>
      </div>

      <form onSubmit={onVerify} className="space-y-5">
        <MfaCodeInput
          value={code}
          onChange={onCodeChange}
          disabled={isVerifying || cooldown > 0}
        />

        <Button type="submit" disabled={isVerifying || cooldown > 0} className="h-12 w-full rounded-lg border border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:opacity-60">
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      {onBack && (
        <div className="pt-1 pb-1">
          <Button variant="ghost" type="button" onClick={onBack} disabled={isVerifying} className="mx-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition bg-transparent hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      )}

      {onUseBackupCode ? (
        <p className="text-center text-sm text-white/72">
          Lost your authenticator app? Use{" "}
          <button type="button" onClick={onUseBackupCode} className="font-semibold text-[#ffd700] underline decoration-transparent transition hover:decoration-[#ffd700]">
            Backup Code
          </button>
        </p>
      ) : null}
    </div>
  );
}