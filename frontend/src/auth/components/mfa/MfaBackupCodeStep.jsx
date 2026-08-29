import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MfaBackupCodeStep({ backupCode, cooldown = 0, isVerifying, onBackupCodeChange, onVerify, onBack }) {
  return (
    <Card className="border-0 ring-0 bg-transparent shadow-none overflow-visible">
      <CardContent className="space-y-6 text-center p-0">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Backup Code</h1>
        </div>

        <form onSubmit={onVerify} className="space-y-5">
          <Input type="text" value={backupCode} onChange={(event) => onBackupCodeChange(event.target.value)} placeholder="Enter backup code" disabled={isVerifying || cooldown > 0} className="h-12 w-full rounded-xl border border-[#ffd700]/50 bg-white/95 px-4 text-center font-mono text-base font-semibold text-[#351018] outline-none transition placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-60"/>

          <Button type="submit" disabled={isVerifying || !backupCode || cooldown > 0} className="h-12 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300">
            {isVerifying ? "Verifying..." : "Verify Backup Code"}
          </Button>
        </form>

        {onBack && (
          <div className="pt-2">
            <Button variant="ghost" type="button" onClick={onBack} disabled={isVerifying} className="mx-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition bg-transparent hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}