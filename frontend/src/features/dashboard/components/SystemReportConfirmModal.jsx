import { useState } from "react";
import { ArrowDownToLine } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AnimatedTags from "../../../components/AnimatedTags";

export default function SystemReportConfirmModal({ open, colorMode = "light", isGenerating = false, onCancel, onConfirm }) {
  const [selectedTags, setSelectedTags] = useState([
    "User Data",
    "App Clients",
    "Audit Logs"
  ]);

  const handleConfirm = () => {
    onConfirm({
      includeUsers: selectedTags.includes("User Data"),
      includeClients: selectedTags.includes("App Clients"),
      includeLogs: selectedTags.includes("Audit Logs"),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e]">
            <ArrowDownToLine className="h-6 w-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Generate system report?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Download the latest system report. Select the sections to include:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex justify-center w-full">
          <AnimatedTags 
            initialTags={["User Data", "App Clients", "Audit Logs"]}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
        </div>

        <AlertDialogFooter className="justify-center sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isGenerating || selectedTags.length === 0}
            className="bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
