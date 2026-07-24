import { FileSearchCorner } from "lucide-react";
import { ViewLogIcon } from "./auditLogIcons";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export default function LogsTable({ loading = false, logs, onView, colorMode = "light", emptyMessage = "No logs found", logTypeLabel = "log" }) {
  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col">
        <Frame spacing="xs">
          <FramePanel className="p-0!">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-[200px]">Actor</TableHead>
              <TableHead className="w-[180px] text-center">Timestamp</TableHead>
              <TableHead className="w-[250px] text-center">Target</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center justify-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </FramePanel>
      </Frame>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col mt-4">
      <Frame spacing="xs">
        <FramePanel className="p-0!">
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[200px]">Actor</TableHead>
            <TableHead className="w-[180px] text-center">Timestamp</TableHead>
            <TableHead className="w-[250px] text-center">Target</TableHead>
            <TableHead className="w-[120px] text-center">Status</TableHead>
            <TableHead className="w-[150px] text-center">Action</TableHead>
            <TableHead className="w-[100px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <div className="flex items-center justify-center w-full py-10 mt-4">
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
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}>
                <TableCell className="w-[200px] pl-6" title={log.actor}>
                  <div className="flex items-center justify-start gap-3">
                    <Avatar className="h-9 w-9 dark:border dark:border-gray-300 shrink-0">
                      <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium">
                        {getInitials(log.actor)}
                      </AvatarFallback>
                    </Avatar>
                    {log.actor && log.actor.length > 20 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer">
                              {log.actor.substring(0, 20)}...
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-none">
                            <p className="break-all">{log.actor}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{log.actor}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-center">{log.timestamp}</TableCell>
                <TableCell className="w-[250px] break-words text-center" title={log.target}>
                  {log.target}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(log.status)}`}>
                      {log.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-[150px] break-words text-center">
                  {log.action}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView(log)} aria-label={`View ${log.actor} ${logTypeLabel} details`}>
                      <ViewLogIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>
        </FramePanel>
      </Frame>
    </div>
  );
}