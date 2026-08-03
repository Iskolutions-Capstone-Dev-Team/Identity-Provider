import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArchiveRestore } from 'lucide-react'

export default function UnarchiveConfirmModal({ open, message = "Restore this user?", onCancel, onConfirm, colorMode }) {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    if (open) {
      setDisplayMessage(message);
    }
  }, [open, message]);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/10 dark:text-[#f8d24e]">
            <ArchiveRestore className="w-8 h-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>{displayMessage}</AlertDialogTitle>
          <AlertDialogDescription>
            This user will be moved back to the user pool.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#f8d24e]/90 transition-colors duration-200">
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
