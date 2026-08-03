import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "../../../utils/formatTimestamp";

export function CreateBackupCard({
  loadingLatest,
  latestBackup,
  loadingBackup,
  onRunBackup,
}) {
  return (
    <Card className="bg-muted/30 border-border/40 shadow-sm flex flex-col overflow-hidden p-0">
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 dark:from-[#f8d24e]/10 to-transparent py-8 px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/10 dark:bg-[#f8d24e]/10 blur-2xl" />
          <Download aria-hidden="true" className="relative size-16 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />
        </div>
        <h3 className="text-foreground text-lg font-semibold text-center">
          Create Backup
        </h3>
        <p className="text-muted-foreground text-sm text-center max-w-sm mt-2">
          Generate a new backup of the identity database. This will create a compressed SQL dump (.sql.gz) and automatically upload it to secure storage.
        </p>
      </div>
      <CardContent className="flex flex-col justify-between flex-grow gap-6 p-6">
        <div className="space-y-4">
          <div className="bg-muted/60 rounded-lg p-4 space-y-4">
            <div className="text-muted-foreground text-xs font-medium uppercase">
              Latest Backup Details
            </div>
            {loadingLatest ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ) : latestBackup ? (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-foreground font-medium">Date</span>
                  <span className="text-muted-foreground">{latestBackup.created_at ? formatTimestamp(latestBackup.created_at) : "-"}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-foreground font-medium">Filename</span>
                  <span className="text-muted-foreground font-mono text-xs truncate max-w-[180px]" title={latestBackup.filename || ""}>{latestBackup.filename || "-"}</span>
                </div>
                {latestBackup.size && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-foreground font-medium">Size</span>
                    <span className="text-muted-foreground">{latestBackup.size}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm italic text-muted-foreground">
                No recent backup found.
              </div>
            )}
          </div>
        </div>
        <Button onClick={onRunBackup} disabled={loadingBackup} className="w-full sm:w-auto self-start bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
          {loadingBackup ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2" />
              Generating Backup...
            </>
          ) : (
            "Run Backup Now"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
