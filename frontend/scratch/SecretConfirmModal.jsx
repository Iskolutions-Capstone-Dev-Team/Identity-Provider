import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeyIcon } from "./appClientIcons";

export default function SecretConfirmModal({ open, message = "Generate a new client secret?", onCancel, onConfirm, colorMode = "light" }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card text-card-foreground border-border text-center">
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyIcon />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
            {message}
          </DialogTitle>
          
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Your existing secret will be replaced.
          </DialogDescription>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50 sm:justify-center">
          <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:justify-center w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={onConfirm}>
              Generate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
