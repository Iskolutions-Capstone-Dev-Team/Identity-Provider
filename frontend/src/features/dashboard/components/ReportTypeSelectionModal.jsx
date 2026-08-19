import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { FileText, Database } from "lucide-react";

function ReportOptionButton({ title, description, icon, onClick, disabled }) {
  return (
    <Button variant="outline" className="group/button h-auto justify-start gap-3 px-4 py-3 text-left w-full" onClick={onClick} disabled={disabled}>
      <div className="bg-muted text-accent-foreground group-hover/button:bg-background rounded-md flex size-10 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate font-semibold">{title}</span>
        <span className="text-muted-foreground text-xs font-normal truncate">
          {description}
        </span>
      </div>
    </Button>
  );
}

export default function ReportTypeSelectionModal({ open, onClose, onSelectType }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()} dismissible={false}>
      <DialogContent className="sm:max-w-md" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
          <div className="space-y-5 px-2 mt-4 pb-6">
            <div className="space-y-4">
              <ReportOptionButton
                title="Authentication Report"
                description="Export security and login metrics."
                icon={<FileText className="size-5" />}
                onClick={() => onSelectType?.('authentication')}
              />
              <ReportOptionButton
                title="System Report"
                description="Export users, clients, and logs."
                icon={<Database className="size-5" />}
                onClick={() => onSelectType?.('system')}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
