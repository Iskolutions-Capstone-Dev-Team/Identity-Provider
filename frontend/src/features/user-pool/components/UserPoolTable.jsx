import { shortenId } from "../../../utils/shortenId";
import { ADMIN_USER_TYPE, getAppClientNamesByIds } from "../../../utils/userPoolAccess";
import { Eye, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getStatusBadgeVariant(status) {
  if (status === "active") return "success-outline";
  if (status === "inactive" || status === "suspended") return "destructive-outline";
  return "default";
}

function getFullName(user) {
  const fullName = [user.givenName, user.middleName, user.surname, user.suffix]
    .filter(Boolean)
    .join(" ");
  return fullName || user.displayName || user.email || "User";
}

function getUserLabel(user) {
  return user.displayName || user.email || "User";
}

function getInitials(user) {
  const firstName = user.givenName?.trim() || "";
  const lastName = user.surname?.trim() || "";
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (user.displayName) {
    const parts = user.displayName.split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return "U";
}

function normalizeClientNameList(clientNames = []) {
  return Array.from(
    new Set(
      (Array.isArray(clientNames) ? clientNames : [])
        .map((clientName) => (typeof clientName === "string" ? clientName.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function getRegularAccessItems(user, appClients) {
  const responseClientNames = normalizeClientNameList(user?.accessibleClientNames);
  if (responseClientNames.length > 0) return responseClientNames;
  return getAppClientNamesByIds(user?.accessibleClientIds, appClients);
}

export default function UserPoolTable({
  loading = false,
  users = [],
  userType = "regular",
  appClients = [],
  onView,
  onEdit,
  onDelete,
  showViewAction = true,
  showEditAction = true,
  showDeleteAction = false,
}) {
  const isAdminView = userType === ADMIN_USER_TYPE;
  const accessColumnLabel = isAdminView ? "Role" : "Accessible Clients";
  const emptyAccessLabel = isAdminView ? "No role assigned" : "No clients";
  const showActionsColumn = showViewAction || showEditAction || showDeleteAction;

  const getAccessItems = (user) => (isAdminView ? user.roles : getRegularAccessItems(user, appClients));

  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col">
        <Frame spacing="xs">
          <FramePanel className="p-0!">
            <Table>
              <TableHeader>
                <TableRow>
              <TableHead className="pl-6 w-[25%]">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">{accessColumnLabel}</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {showActionsColumn && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center justify-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-40 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                {showActionsColumn && (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {showViewAction && <Skeleton className="h-8 w-8 rounded-md" />}
                      {showEditAction && <Skeleton className="h-8 w-8 rounded-md" />}
                      {showDeleteAction && <Skeleton className="h-8 w-8 rounded-md" />}
                    </div>
                  </TableCell>
                )}
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
    <div className="mx-auto flex w-full flex-col">
      <Frame spacing="xs">
        <FramePanel className="p-0!">
          <Table>
            <TableHeader>
              <TableRow>
            <TableHead className="pl-6 w-[25%]">Name</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">ID</TableHead>
            <TableHead className="text-center">{accessColumnLabel}</TableHead>
            <TableHead className="text-center">Status</TableHead>
            {showActionsColumn && <TableHead className="text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={showActionsColumn ? 6 : 5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}

          {users.map((user) => {
            const accessItems = getAccessItems(user);

            return (
              <TableRow key={user.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center justify-start gap-3">
                    <Avatar className="h-9 w-9 dark:border dark:border-gray-300">
                      <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{getFullName(user)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{user.email}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger render={<span className="font-medium cursor-help border-b border-dashed border-gray-400" />}>
                        {shortenId(user.id)}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  {accessItems.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {accessItems.map((item, idx) => (
                        <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">{emptyAccessLabel}</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize font-semibold rounded-full px-3">
                    {user.status}
                  </Badge>
                </TableCell>
                {showActionsColumn && (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {showViewAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors"
                          onClick={() => onView(user)}
                          title={`View ${getUserLabel(user)}`}
                        >
                          <Eye className="h-6 w-6" />
                        </Button>
                      )}
                      {showEditAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors"
                          onClick={() => onEdit(user)}
                          title={`Edit ${getUserLabel(user)}`}
                        >
                          <Pencil className="h-6 w-6" />
                        </Button>
                      )}
                      {showDeleteAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors"
                          onClick={() => onDelete(user)}
                          title={`Delete ${getUserLabel(user)}`}
                        >
                          <Trash className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </FramePanel>
      </Frame>
    </div>
  );
}