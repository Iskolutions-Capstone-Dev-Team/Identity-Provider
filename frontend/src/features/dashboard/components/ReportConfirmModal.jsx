import { useState } from "react";
import { ArrowDownToLine } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AnimatedTags from "../../../components/AnimatedTags";

export default function ReportConfirmModal({ open, colorMode = "light", isGenerating = false, onCancel, onConfirm }) {
  const [selectedTags, setSelectedTags] = useState([
    "Security Analysis",
    "Authentication Statistics",
    "Failed Attempts"
  ]);

  const handleConfirm = () => {
    onConfirm({
      includeSecurityAnalysis: selectedTags.includes("Security Analysis"),
      includeAuthStats: selectedTags.includes("Authentication Statistics"),
      includeFailedAttempts: selectedTags.includes("Failed Attempts"),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e]">
            <ArrowDownToLine className="h-6 w-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Generate metrics report?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Generate and download the latest authentication report. Select the sections to include:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex justify-center w-full">
          <AnimatedTags 
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
        </div>

        <AlertDialogFooter className="justify-center sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isGenerating || selectedTags.length === 0}
            className="bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e] dark:hover:bg-[#f8d24e]/30"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}