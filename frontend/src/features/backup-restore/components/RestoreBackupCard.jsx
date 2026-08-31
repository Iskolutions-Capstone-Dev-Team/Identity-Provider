import { UploadCloud, PlusIcon, XIcon, FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function RestoreBackupCard({
  selectedFile,
  onFileChange,
  loadingRestore,
  onRestoreBackup,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange({ target: { files: e.dataTransfer.files, value: "" } });
    }
  };

  const openFileDialog = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    onFileChange({ target: { files: [], value: "" } });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="bg-muted/30 border-border/40 shadow-sm flex flex-col overflow-hidden p-0">
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 dark:from-[#f8d24e]/10 to-transparent py-8 px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/10 dark:bg-[#f8d24e]/10 blur-2xl" />
          <UploadCloud aria-hidden="true" className="relative size-16 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />
        </div>
        <h3 className="text-foreground text-lg font-semibold text-center">
          Restore Backup
        </h3>
        <p className="text-muted-foreground text-sm text-center max-w-sm mt-2">
          Upload a `.sql.gz` backup file to restore the database to a previous state. This operation will overwrite current data.
        </p>
      </div>
      <CardContent className="flex flex-col justify-between flex-grow gap-6 p-6">
        <div className="flex flex-col flex-grow">
          <div
            className={cn(
              "border-border rounded-lg flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 border border-dashed p-4 transition-colors flex-grow",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Input ref={inputRef} type="file" accept=".sql.gz,application/gzip" onChange={onFileChange} className="sr-only"/>

            {!selectedFile ? (
              <>
                <Button
                  onClick={openFileDialog}
                  size="sm"
                  className={cn("bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] transition-colors duration-200", isDragging && "animate-bounce")}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add files
                </Button>
                <div className="flex flex-1 items-center gap-2">
                  <p className="text-muted-foreground text-sm">
                    Drop files here or click to browse (max 1 file, .sql.gz only)
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center gap-2 w-full">
                <div className="group/item relative shrink-0 flex items-center gap-3 w-full">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg border shrink-0">
                    <FileIcon className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                  
                  <Button onClick={removeFile} variant="outline" size="icon" className="size-8 rounded-full shadow-sm shrink-0 hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] transition-colors duration-200">
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button onClick={onRestoreBackup} disabled={loadingRestore || !selectedFile} className="w-full sm:w-auto self-start bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
          {loadingRestore ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2" />
              Restoring Database...
            </>
          ) : (
            "Restore Database"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
