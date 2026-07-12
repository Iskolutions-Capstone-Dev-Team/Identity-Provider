import { shortenId } from "../../../utils/shortenId";
import { ADMIN_USER_TYPE, getAppClientNamesByIds } from "../../../utils/userPoolAccess";
import { Eye, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getStatusBadgeClasses(status) {
  if (status === "active") return "bg-green-500 hover:bg-green-600 text-white border-transparent";
  if (status === "inactive" || status === "suspended") return "bg-red-500 hover:bg-red-600 text-white border-transparent";
  return "bg-secondary text-secondary-foreground border-transparent";
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">{accessColumnLabel}</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {showActionsColumn && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-40 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
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
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">ID</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Name</TableHead>
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
                <TableCell className="text-center">{user.email}</TableCell>
                <TableCell className="text-center">{getFullName(user)}</TableCell>
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
                  <Badge className={`capitalize font-semibold rounded-full px-3 ${getStatusBadgeClasses(user.status)}`}>
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
                          onClick={() => onView(user)}
                          title={`View ${getUserLabel(user)}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {showEditAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          title={`Edit ${getUserLabel(user)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {showDeleteAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => onDelete(user)}
                          title={`Delete ${getUserLabel(user)}`}
                        >
                          <Trash className="h-4 w-4" />
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
    </div>
  );
}