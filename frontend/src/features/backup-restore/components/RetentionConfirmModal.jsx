import { Archive, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RetentionConfirmModal({
  open,
  onCancel,
  onConfirm,
  isRunning = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && !isRunning && onCancel?.()}>
      <AlertDialogContent size="sm" className="max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e]">
            <Archive className="h-6 w-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Run Log Retention Now?</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm">
            Logs older than <strong>13 months</strong> will be moved to secure backup storage.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert className="my-2 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Archived records won't appear in active views, but remain safe in backups.
          </AlertDescription>
        </Alert>

        <AlertDialogFooter className="justify-center sm:justify-center mt-3">
          <AlertDialogCancel
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isRunning}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            disabled={isRunning}
            className="bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
          >
            {isRunning ? (
              <>
                <span className="loading loading-spinner loading-xs mr-2" />
                Running...
              </>
            ) : (
              "Confirm & Run"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
