import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MfaBackupCodeStep({ backupCode, cooldown = 0, isVerifying, onBackupCodeChange, onVerify }) {
  return (
    <Card className="border-0 ring-0 bg-transparent shadow-none overflow-visible">
      <CardContent className="space-y-6 text-center p-0">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Backup Code</h1>
        </div>

        <form onSubmit={onVerify} className="space-y-5">
          <Input type="text" value={backupCode} onChange={(event) => onBackupCodeChange(event.target.value)} placeholder="Enter backup code" disabled={isVerifying || cooldown > 0} className="h-12 w-full rounded-xl border border-[#ffd700]/50 bg-white/95 px-4 text-center font-mono text-base font-semibold text-[#351018] outline-none transition placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-60"/>

          <Button type="submit" disabled={isVerifying || cooldown > 0} className="h-12 w-full bg-[#991b1b] text-white hover:bg-[#7b0d15] font-bold transition duration-300">
            {isVerifying ? "Verifying..." : "Verify Backup Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}