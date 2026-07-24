import { Eye, Pencil, Trash2, KeyRound, Copy, CopyCheck, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";
import { useState } from "react";
import { toast } from "sonner";

const getClientId = (client) => client?.id ?? client?.clientId ?? "";

function CopyClientIdButton({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Client ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-0.5 text-muted-foreground hover:text-foreground transition-colors rounded ml-1"
      title="Copy Client ID"
    >
      {copied ? (
        <CopyCheck className="h-3.5 w-3.5 text-[#00d053]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export default function ConnectedAppClientCards({ 
  loading = false, 
  clients, 
  onView, 
  onEdit, 
  onDelete, 
  onRotateSecret, 
  showEditAction = true, 
  showDeleteAction = true, 
  showRotateSecretAction = true, 
  colorMode = "light" 
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border shadow-sm flex flex-col">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0 bg-transparent border-b">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-4 flex items-center justify-between mt-auto border-t bg-card">
              <div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-10 border rounded-xl bg-card text-muted-foreground shadow-sm">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-primary h-24 w-22">
                <Monitor className="text-[#7b0d15] dark:text-primary size-5" />
              </IconStack>
            </EmptyMedia>
            <EmptyTitle>No app clients found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any app clients matching your criteria.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {clients.map((client) => {
        const imageSrc = client.image ? (client.image.startsWith("data:") ? client.image : `${client.image}`) : undefined;
        
        return (
          <Card key={client.clientId || client.id} className="overflow-hidden border shadow-sm flex flex-col hover:border-[#7b0d15]/40 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0 border-b bg-transparent">
              <Avatar className="h-12 w-12 dark:border dark:border-gray-300 shrink-0">
                <AvatarImage src={imageSrc} alt={client.name} className="object-cover" />
                <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium text-lg">
                  {(client.name || "A").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0 overflow-hidden">
                <span className="text-base font-semibold truncate" title={client.name}>
                  {client.name}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-muted-foreground text-xs truncate">
                    {client.id || client.clientId}
                  </span>
                  <CopyClientIdButton id={getClientId(client)} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</span>
                <span className="text-sm">{client.created}</span>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-3 flex items-center justify-between border-t mt-auto bg-card">
              <div>
                {showRotateSecretAction && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors"
                    onClick={() => onRotateSecret?.({
                      id: getClientId(client),
                      name: client.name,
                    })}
                    title={`Rotate secret for ${client.name}`}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView?.(client)} title={`View ${client.name}`}>
                  <Eye className="h-4 w-4" />
                </Button>
                {showEditAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onEdit?.(client)} title={`Edit ${client.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {showDeleteAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onDelete?.(client)} title={`Delete ${client.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
