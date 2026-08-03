import { UploadCloud, FileType, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RestoreBackupCard({
  selectedFile,
  onFileChange,
  loadingRestore,
  onRestoreBackup,
}) {
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
        <div className="space-y-4">
          <div className="relative p-6 bg-background rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center gap-3">
            {!selectedFile ? (
              <>
                <div className="p-3 bg-muted rounded-full">
                  <FileType className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to select or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">.sql.gz files only</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground max-w-[200px] truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}
            
            <Input type="file" accept=".sql.gz,application/gzip" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
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
