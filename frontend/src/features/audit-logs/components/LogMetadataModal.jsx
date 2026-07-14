import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMetadata(metadata) {
  if (metadata == null) {
    return "";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata, null, 2);
}

function DetailField({ label, value }) {
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 break-all text-sm font-medium text-foreground">
          {value ?? "-"}
        </p>
      </CardContent>
    </Card>
  );
}

const SECURITY_LOG_TYPE = "security";

export default function LogMetadataModal({ open, log, logType = "transaction", loading, error, onClose, colorMode = "light" }) {
  const isSecurityLog = logType === SECURITY_LOG_TYPE;
  const metadataText = formatMetadata(log?.metadata);
  const modalTitle = isSecurityLog ? "Security Log Metadata" : "Transaction Log Metadata";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground">
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 -mx-4 no-scrollbar max-h-[60vh] px-4 overflow-y-auto pb-2">
          <div className="space-y-6 pt-0 pb-4 px-2">
            <section>
              <Card className="bg-muted/30 border-border/40 shadow-sm">
                <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {log?.actor}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <p className="text-sm text-muted-foreground font-mono">
                        TIMESTAMP: {log?.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold bg-muted/50 border-border/50 text-foreground">
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        {log?.action}
                      </Badge>
                      <Badge 
                        variant={log?.status?.toLowerCase() === 'success' || log?.status?.toLowerCase() === 'active' ? 'success-outline' : 'destructive-outline'}
                        className={cn(
                          "rounded-full px-3 py-1 font-semibold",
                          log?.status?.toLowerCase() === 'success' || log?.status?.toLowerCase() === 'active'
                            ? "bg-[#00d053]/10 border-transparent text-[#00d053] hover:bg-[#00d053]/20" 
                            : "bg-[#ff2f3e]/10 border-transparent text-[#ff2f3e] hover:bg-[#ff2f3e]/20"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        <span className="capitalize">{log?.status}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold bg-muted/50 border-border/50 text-foreground">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        {log?.target}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

          <section>
            <h4 className="text-sm font-medium mb-3">Raw Metadata</h4>
            
            {loading && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Loading metadata...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {!loading && !metadataText && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                No metadata available.
              </div>
            )}

            {!loading && metadataText && (
              <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs font-mono">
                {metadataText}
              </pre>
            )}
            </section>
          </div>
        </div>

        <DialogFooter className="-mx-4 -mb-4 mt-2 px-4 py-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}