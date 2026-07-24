import { Eye, Pencil, Trash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";

function getInitials(text) {
  if (!text) return "A";
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}

const MAX_VISIBLE_CLIENT_SLOTS = 5;

function getPreviewClientItems(clientNames = []) {
  const normalizedClientNames = Array.isArray(clientNames) ? clientNames : [];
  return normalizedClientNames.slice(0, MAX_VISIBLE_CLIENT_SLOTS);
}

function getRemainingClientCount(totalClientCount = 0) {
  return Math.max(0, totalClientCount - MAX_VISIBLE_CLIENT_SLOTS);
}

export default function RegistrationCards({ loading = false, rows = [], onView, onEdit, onDelete, showEditAction = true, showDeleteAction = true, colorMode = "light" }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border shadow-sm flex flex-col">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0 bg-transparent border-b">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-5 w-3/4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-4 flex items-center justify-end mt-auto border-t">
              <div className="flex gap-2">
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

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-10 border rounded-xl bg-card text-muted-foreground shadow-sm">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-primary h-24 w-22">
                <FileText className="text-[#7b0d15] dark:text-primary size-5" />
              </IconStack>
            </EmptyMedia>
            <EmptyTitle>No account type found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any account types matching your criteria.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {rows.map((row) => {
        const previewClientItems = getPreviewClientItems(row.clientNames);
        const remainingClientCount = getRemainingClientCount(row.totalClientCount);

        return (
          <Card key={row.accountType} className="overflow-hidden border shadow-sm flex flex-col hover:border-[#7b0d15]/40 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0 border-b bg-transparent">
              <Avatar className="h-12 w-12 dark:border dark:border-gray-300 shrink-0">
                <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium text-lg">
                  {getInitials(row.label)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0 overflow-hidden">
                <span className="text-base font-semibold truncate" title={row.label}>
                  {row.label}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client List</span>
                {row.clientNames.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {previewClientItems.map((clientName, previewIndex) => (
                        <Badge key={`${row.accountType}-${clientName}-${previewIndex}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">
                          {clientName}
                        </Badge>
                      ))}
                    </div>
                    {remainingClientCount > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        +{remainingClientCount} more {remainingClientCount === 1 ? "client" : "clients"}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No pre-approved clients
                  </span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-3 flex items-center justify-end border-t mt-auto bg-card">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView(row)} title={`View ${row.label} registration settings`}>
                  <Eye className="h-4 w-4" />
                </Button>

                {showEditAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onEdit(row)} title={`Edit ${row.label} registration settings`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {showDeleteAction && row.canDelete !== false && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onDelete(row)} title={`Delete ${row.label} registration settings`}>
                    <Trash className="h-4 w-4" />
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
