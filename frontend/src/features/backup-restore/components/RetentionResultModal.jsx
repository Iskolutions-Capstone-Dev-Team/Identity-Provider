import { CheckCircle2, FileArchive, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RetentionResultModal({
  open,
  onClose,
  result = null,
}) {
  if (!result) return null;

  const totalPurged =
    (Number(result.audit_logs_purged) || 0) +
    (Number(result.security_logs_purged) || 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="size-7" />
          </div>
          <DialogTitle>Log Retention Completed</DialogTitle>
          <DialogDescription>
            {totalPurged > 0
              ? "Logs older than the cutoff date were successfully archived."
              : "No logs were older than the cutoff date. All active records remain preserved."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="bg-muted/60 rounded-lg p-3 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground uppercase font-semibold">Cutoff Date</span>
              <span className="font-medium text-foreground">{result.cutoff_date || "-"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground uppercase font-semibold">Execution Duration</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                {result.duration || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t pt-2">
              <span className="text-muted-foreground uppercase font-semibold">Total Logs Archived</span>
              <span className="font-bold text-foreground">{totalPurged.toLocaleString()} records</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="border rounded-lg p-3 bg-card">
              <div className="text-xs text-muted-foreground">Audit Logs Archived</div>
              <div className="text-xl font-bold text-[#7b0d15] dark:text-[#f8d24e] mt-1">
                {(result.audit_logs_purged || 0).toLocaleString()}
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-card">
              <div className="text-xs text-muted-foreground">Security Logs Archived</div>
              <div className="text-xl font-bold text-[#7b0d15] dark:text-[#f8d24e] mt-1">
                {(result.security_logs_purged || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {Array.isArray(result.archive_files) && result.archive_files.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase block">
                Generated Archives ({result.archive_files.length})
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 rounded border bg-muted/30 p-2 text-xs font-mono">
                {result.archive_files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate text-muted-foreground">
                    <FileArchive className="size-3.5 shrink-0 text-[#7b0d15] dark:text-[#f8d24e]" />
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
