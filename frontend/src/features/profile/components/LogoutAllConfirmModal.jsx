import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "../../../components/ui/alert-dialog"
import { LogOut } from "lucide-react"

export default function LogoutAllConfirmModal({ isOpen, isLoggingOut, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-[#f8d24e]/20 dark:text-[#f8d24e]">
                        <LogOut />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Sign out all devices?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will log you out from all other active sessions and devices.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isLoggingOut}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        variant="destructive"
                        className="dark:bg-[#f8d24e]/20 dark:text-[#f8d24e] dark:hover:bg-[#f8d24e]/30"
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }} 
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Signing out..." : "Sign out all"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
