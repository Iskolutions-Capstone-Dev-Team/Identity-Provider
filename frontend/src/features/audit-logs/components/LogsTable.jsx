import EmptySearchState from "../../../components/EmptySearchState";
import { ViewLogIcon } from "./auditLogIcons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] text-center">Timestamp</TableHead>
              <TableHead className="w-[200px] text-center">Actor</TableHead>
              <TableHead className="w-[250px] text-center">Target</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
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
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] text-center">Timestamp</TableHead>
            <TableHead className="w-[200px] text-center">Actor</TableHead>
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
                <EmptySearchState message={emptyMessage} colorMode={colorMode} />
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}>
                <TableCell className="font-medium text-center">{log.timestamp}</TableCell>
                <TableCell className="w-[200px] break-words text-center" title={log.actor}>
                  {log.actor}
                </TableCell>
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
                    <Button variant="ghost" size="icon" onClick={() => onView(log)} aria-label={`View ${log.actor} ${logTypeLabel} details`}>
                      <ViewLogIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}