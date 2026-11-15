import { Archive, ShieldCheck, Clock, HardDrive, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LogRetentionCard({
  isSuperadmin = false,
  loadingRetention = false,
  onOpenConfirm,
}) {
  return (
    <Card className="bg-muted/30 border-border/40 shadow-sm flex flex-col overflow-hidden p-0 w-full">
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 dark:from-[#f8d24e]/10 to-transparent py-8 px-4 sm:px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/10 dark:bg-[#f8d24e]/10 blur-2xl" />
          <Archive aria-hidden="true" className="relative size-16 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-base sm:text-lg font-semibold text-center">
            Log Retention & Purge
          </h3>
          <Badge variant="outline" className="text-xs bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e] border-none font-semibold shrink-0">
            13 Months
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm text-center max-w-sm sm:max-w-lg mt-2">
          Automatically archives historical security and audit logs older than 13 months into secure long-term storage to keep the system running efficiently.
        </p>
      </div>

      <CardContent className="flex flex-col justify-between flex-grow gap-6 p-4 sm:p-6">
        <div className="flex flex-col flex-grow">
          <div className="bg-muted/60 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col justify-center flex-grow">
            <div className="text-muted-foreground text-xs font-medium uppercase">
              Retention Policy Settings
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
                <span className="text-foreground font-medium flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Calendar className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
                  Automated Schedule
                </span>
                <span className="text-muted-foreground font-mono text-[11px] sm:text-xs text-right whitespace-nowrap">Daily @ 08:00 UTC</span>
              </div>

              <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
                <span className="text-foreground font-medium flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Clock className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
                  Retention Period
                </span>
                <span className="text-muted-foreground text-right whitespace-nowrap">13 Months</span>
              </div>

              <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
                <span className="text-foreground font-medium flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <HardDrive className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
                  Covered Records
                </span>
                <span className="text-muted-foreground text-right whitespace-nowrap">Audit & Security Logs</span>
              </div>

              <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
                <span className="text-foreground font-medium flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <ShieldCheck className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
                  Storage Type
                </span>
                <span className="text-muted-foreground text-right whitespace-nowrap">Secure Compressed Archive</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!isSuperadmin && (
            <p className="text-xs text-muted-foreground italic">
              Manual retention execution requires Superadmin privileges.
            </p>
          )}

          <Button
            type="button"
            onClick={onOpenConfirm}
            disabled={loadingRetention || !isSuperadmin}
            title={!isSuperadmin ? "Superadmin role required to trigger manual retention" : ""}
            className="w-full sm:w-auto self-start bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200"
          >
            {loadingRetention ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2" />
                Running...
              </>
            ) : (
              "Run Retention Now"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
