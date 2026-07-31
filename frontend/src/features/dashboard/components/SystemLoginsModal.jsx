import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Activity, Copy, CopyCheck } from "lucide-react";
import { IconStack } from "@/components/reui/icon-stack";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const DEFAULT_CLIENT_IMAGE = "/assets/images/PUP_Logo.png";
const ITEMS_PER_PAGE = 5;

function SystemLoginRow({ client, colorMode }) {
  const [copied, setCopied] = useState(false);
  const isDarkMode = colorMode === "dark";
  const loginCount = Number(client.login_count) || 0;

  const handleCopy = () => {
    if (!client.client_id) return;
    navigator.clipboard.writeText(client.client_id);
    setCopied(true);
    toast.success("Client ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-sm border-border/50 bg-card/50 transition-colors hover:bg-muted/50 overflow-hidden">
      <CardContent className="flex items-center justify-between py-2 px-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-lg">
            <AvatarImage src={client.image_url || DEFAULT_CLIENT_IMAGE} alt={client.client_name || "Client"} className="rounded-lg object-cover" />
            <AvatarFallback className="rounded-lg bg-transparent">
              <img src={DEFAULT_CLIENT_IMAGE} alt="PUP Logo" className="h-full w-full rounded-lg object-cover" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left">
            <p className={`truncate text-sm font-semibold ${
              isDarkMode ? "text-white" : "text-[#2a1518]"
            }`}>
              {client.client_name || "Unnamed Client"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className={`truncate text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                {client.client_id || "No client ID"}
              </p>
              {client.client_id && (
                <Button size="icon-sm" variant="ghost" onClick={handleCopy} className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Copy client ID">
                  {copied ? <CopyCheck className="h-3.5 w-3.5 text-[#00d053]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="pl-4 text-right">
          <p className={`text-lg font-black ${
            isDarkMode ? "text-[#f8d24e]" : "text-[#7b0d15]"
          }`}>
            {loginCount.toLocaleString()}
          </p>
          <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
            logins
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SystemLoginsModal({ open, period, colorMode = "light", onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const isDarkMode = colorMode === "dark";

  // Reset page when period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [period]);

  if (!period) {
    return null;
  }

  const clients = period.topClients || [];
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const scrollClassName = isDarkMode
    ? "[scrollbar-width:thin] [scrollbar-color:rgba(248,210,78,0.58)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/55 hover:[&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/75"
    : "[scrollbar-width:thin] [scrollbar-color:rgba(123,13,21,0.5)_rgba(123,13,21,0.08)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#7b0d15]/[0.08] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/70";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-4 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle className="text-xl">
            {period.shortLabel?.toLowerCase().includes("today") ? "Today's Logins" : "Monthly Logins"}
          </DialogTitle>
          <p className="text-sm mt-1 opacity-90">
            Successful logins per application.
          </p>
        </DialogHeader>

        <div className={`overflow-y-auto px-1 max-h-[50vh] ${scrollClassName}`}>
          <div className="flex flex-col gap-3 pb-2 pt-4 text-left">
            {displayedClients.length > 0 ? (
              displayedClients.map((client) => (
                <SystemLoginRow 
                  key={client.client_id || client.client_name} 
                  client={client} 
                  colorMode={colorMode} 
                />
              ))
            ) : (
              <div className="flex items-center justify-center p-4">
                <Empty className="py-8 max-w-md">
                  <EmptyHeader>
                    <EmptyMedia>
                      <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e] h-24 w-22">
                        <Activity className="text-[#7b0d15] dark:text-[#f8d24e] size-5" />
                      </IconStack>
                    </EmptyMedia>
                    <EmptyTitle>No login activity</EmptyTitle>
                    <EmptyDescription>
                      No login activity is available for this period.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-2 flex justify-center [&>div]:!justify-center">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              variant="glass"
              colorMode={colorMode}
            />
          </div>
        )}

        <DialogFooter className="sm:justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
