import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";

export default function DeviceRenameModal({ device, isOpen, isRenaming, onClose, onSave }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (isOpen && device) {
            setName(device.name || "");
        }
    }, [isOpen, device]);

    if (!device) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-[#111111] border-slate-200 dark:border-[#222222] [&>button]:!text-white [&>button:hover]:!bg-white/20" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-white dark:hover:bg-white/20">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
                        <DialogTitle className="text-base font-medium">Rename Device</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="sr-only">
                        Rename your trusted device.
                    </DialogDescription>
                    
                    <div className="flex items-center space-x-2 py-6">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="device-name" className="text-sm font-medium leading-none text-foreground">
                                Device Name
                            </Label>
                            <Input
                                id="device-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. My Personal Laptop"
                                maxLength={50}
                                disabled={isRenaming}
                                autoFocus
                                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-white/10 focus-visible:ring-slate-300 dark:focus-visible:ring-white/20 bg-white dark:bg-[#141414] px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Name this device for easy identification.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2 sm:gap-0">

                        <Button 
                            type="submit" 
                            disabled={isRenaming || !name.trim() || name.trim() === device.name}
                            className="flex-1 sm:flex-none bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200"
                        >
                            {isRenaming ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
