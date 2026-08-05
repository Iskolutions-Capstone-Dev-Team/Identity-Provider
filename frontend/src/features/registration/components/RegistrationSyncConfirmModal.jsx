import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RefreshCcw } from 'lucide-react';

export default function RegistrationSyncConfirmModal({ open, accountTypeLabel = "this", isSubmitting = false, onCancel, onConfirm, colorMode = "light" }) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !isSubmitting && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/10 dark:text-[#f8d24e]">
            <RefreshCcw className="w-8 h-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Apply these changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to update all {accountTypeLabel} users with these changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            No
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting} className="bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#f8d24e]/90 transition-colors duration-200">
            {isSubmitting ? "Syncing..." : "Yes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}