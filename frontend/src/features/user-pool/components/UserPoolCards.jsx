import { useState } from "react";
import { toast } from "sonner";
import { ADMIN_USER_TYPE, getAppClientNamesByIds } from "../../../utils/userPoolAccess";
import { Eye, Pencil, Trash, Copy, CopyCheck, Ellipsis, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";

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
  return getFullName(user);
}

function CopyUserIdButton({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-0.5 text-muted-foreground hover:text-foreground transition-colors rounded ml-1"
      title="Copy User ID"
    >
      {copied ? (
        <CopyCheck className="h-3.5 w-3.5 text-[#00d053]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
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

export default function UserPoolCards({
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

  const getAccessItems = (user) => (isAdminView ? user.roles : getRegularAccessItems(user, appClients));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-4 flex items-center justify-between mt-auto border-t">
              <Skeleton className="h-6 w-16 rounded-full" />
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

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-10 border rounded-xl bg-card text-muted-foreground shadow-sm">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-primary h-24 w-22">
                <User className="text-[#7b0d15] dark:text-primary size-5" />
              </IconStack>
            </EmptyMedia>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any users matching your criteria.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {users.map((user) => {
        const accessItems = getAccessItems(user);

        return (
          <Card key={user.id} className="overflow-hidden border shadow-sm flex flex-col hover:border-[#7b0d15]/40 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0 border-b bg-transparent">
              <Avatar className="h-12 w-12 dark:border dark:border-gray-300 shrink-0">
                <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium text-lg">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0 overflow-hidden">
                <span className="text-base font-semibold truncate" title={getFullName(user)}>
                  {getFullName(user)}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-muted-foreground text-xs truncate" title={user.id}>
                    {user.id}
                  </span>
                  <CopyUserIdButton id={user.id} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                <span className="text-sm truncate" title={user.email}>{user.email}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{accessColumnLabel}</span>
                {accessItems.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {accessItems.length > 3 ? (
                      <>
                        {accessItems.slice(0, 3).map((item, idx) => (
                          <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-2 py-0.5 text-[10px]">
                            {item}
                          </Badge>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge asChild className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-1.5 py-0.5 text-[10px] inline-flex items-center justify-center transition-colors cursor-pointer">
                              <button type="button" aria-label="View all accessible clients">
                                <Ellipsis className="w-3 h-3" />
                              </button>
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="w-64 p-3 bg-popover text-popover-foreground border shadow-md rounded-lg">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">
                                All {accessColumnLabel} ({accessItems.length})
                              </h4>
                              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pt-1 pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/25 hover:[&::-webkit-scrollbar-thumb]:bg-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent">
                                {accessItems.map((item, idx) => (
                                  <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-2 py-0.5 text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      accessItems.map((item, idx) => (
                        <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-2 py-0.5 text-[10px]">
                          {item}
                        </Badge>
                      ))
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">{emptyAccessLabel}</span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-3 flex items-center justify-between border-t mt-auto bg-card">
              <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize font-semibold rounded-full px-2.5 py-0.5 text-[11px]">
                {user.status}
              </Badge>
              
              <div className="flex items-center gap-1">
                {showViewAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView(user)} title={`View ${getUserLabel(user)}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {showEditAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onEdit(user)} title={`Edit ${getUserLabel(user)}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {showDeleteAction && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onDelete(user)} title={`Delete ${getUserLabel(user)}`}>
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
