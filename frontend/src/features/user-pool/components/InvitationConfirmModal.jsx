import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, Loader2Icon } from "lucide-react";

function getArticle(label = "") {
  const normalizedLabel = label.trim().toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(normalizedLabel[0]) ? "an" : "a";
}

export default function InvitationConfirmModal({ open, accountTypeLabel = "selected", title = "Send Invitation?", description = "", confirmLabel = "Send Invitation", isSubmitting = false, onCancel, onConfirm, colorMode = "light" }) {
  const article = getArticle(accountTypeLabel);
  const defaultDescription = `This will create the user and send an invitation for ${article} ${accountTypeLabel.toLowerCase()} account.`;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/10 dark:text-[#f8d24e]">
            <Mail className="w-8 h-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting} className="bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#f8d24e]/90 transition-colors duration-200">
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}