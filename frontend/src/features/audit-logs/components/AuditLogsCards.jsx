import { FileSearchCorner } from "lucide-react";
import { ViewLogIcon } from "./auditLogIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";

function getInitials(text) {
  if (!text) return "A";
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}

function getStatusClasses(status) {
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalizedStatus === "success") {
    return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/10";
  }

  if (normalizedStatus === "fail" || normalizedStatus === "failed") {
    return "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-400/10 dark:text-red-200 dark:hover:bg-red-400/10";
  }

  return "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-400/10 dark:text-amber-200 dark:hover:bg-amber-400/10";
}

export default function AuditLogsCards({ loading = false, logs, onView, colorMode = "light", emptyMessage = "No logs found", logTypeLabel = "log" }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-4">
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
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-4 flex items-center justify-between mt-auto border-t">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-10 mt-4 border rounded-xl bg-card text-muted-foreground shadow-sm">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-primary h-24 w-22">
                <FileSearchCorner className="text-[#7b0d15] dark:text-primary size-5" />
              </IconStack>
            </EmptyMedia>
            <EmptyTitle>{emptyMessage}</EmptyTitle>
            <EmptyDescription>
              We couldn't find any {logTypeLabel}s matching your criteria.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mt-4">
      {logs.map((log, index) => (
        <Card key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`} className="overflow-hidden border shadow-sm flex flex-col hover:border-[#7b0d15]/40 transition-colors">
          <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0 border-b bg-transparent">
            <Avatar className="h-12 w-12 dark:border dark:border-gray-300 shrink-0">
              <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium text-lg">
                {getInitials(log.actor)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left min-w-0 overflow-hidden">
              {log.actor && log.actor.length > 20 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-base font-semibold truncate cursor-pointer" title={log.actor}>
                        {log.actor.substring(0, 20)}...
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-none">
                      <p className="break-all">{log.actor}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-base font-semibold truncate" title={log.actor}>
                  {log.actor}
                </span>
              )}
              <span className="text-muted-foreground text-xs mt-1 truncate">
                {log.timestamp}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</span>
              <span className="text-sm">{log.action}</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</span>
              <span className="text-sm break-all" title={log.target}>{log.target}</span>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-3 flex items-center justify-between border-t mt-auto bg-card">
            <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(log.status)}`}>
              {log.status}
            </Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView(log)} aria-label={`View ${log.actor} ${logTypeLabel} details`}>
                <ViewLogIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
