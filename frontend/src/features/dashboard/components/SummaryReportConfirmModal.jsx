import { useState } from "react";
import { ArrowDownToLine, FileJson, FileText } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SummaryReportConfirmModal({ open, colorMode = "light", isGenerating = false, onCancel, onConfirm }) {
  const [timeframe, setTimeframe] = useState("24h");
  const [format, setFormat] = useState("pdf");

  const handleConfirm = () => {
    onConfirm({
      timeframe,
      format,
    });
  };

  const timeframeOptions = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
  ];

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onCancel) onCancel(); }}>
      <AlertDialogContent size="sm" className="max-w-[340px]">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-[#f8d24e]/20 dark:text-[#f8d24e]">
            <ArrowDownToLine className="h-6 w-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Generate Summary Report</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Download a general overview of system usage without personal data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block w-full text-left">Timeframe</span>
            <div className="flex flex-wrap justify-start gap-2">
              {timeframeOptions.map(opt => (
                <Button 
                  key={opt.value} 
                  variant={timeframe === opt.value ? "default" : "outline"}
                  size="sm"
                  className={cn("flex-1", timeframe === opt.value && "bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]")}
                  onClick={() => setTimeframe(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block w-full text-left">Format</span>
            <div className="flex flex-wrap justify-start gap-2">
              <Button 
                variant={format === "pdf" ? "default" : "outline"}
                size="sm"
                className={cn("flex-1 gap-2", format === "pdf" && "bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]")}
                onClick={() => setFormat("pdf")}
              >
                <FileText className="w-4 h-4" /> PDF
              </Button>
              <Button 
                variant={format === "json" ? "default" : "outline"}
                size="sm"
                className={cn("flex-1 gap-2", format === "json" && "bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]")}
                onClick={() => setFormat("json")}
              >
                <FileJson className="w-4 h-4" /> JSON
              </Button>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="justify-center sm:justify-center mt-4">
          <AlertDialogCancel variant="ghost" onClick={onCancel} disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isGenerating}
            className="bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
