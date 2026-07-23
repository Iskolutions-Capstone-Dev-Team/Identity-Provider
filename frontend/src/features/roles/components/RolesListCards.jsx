import { Eye, Pencil, Trash, ShieldUser, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";

function getInitials(text) {
  if (!text) return "R";
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function RolesListCards({ loading = false, roles, onView, onEdit, onDelete, colorMode = "light" }) {
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

  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-10 border rounded-xl bg-card text-muted-foreground shadow-sm">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-primary h-24 w-22">
                <ShieldUser className="text-[#7b0d15] dark:text-primary size-5" />
              </IconStack>
            </EmptyMedia>
            <EmptyTitle>No roles found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any roles matching your criteria.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {roles.map((role) => {
        const permissions = Array.isArray(role.permissionLabels) ? role.permissionLabels : [];

        return (
          <Card key={role.id} className="overflow-hidden border shadow-sm flex flex-col hover:border-[#7b0d15]/40 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0 border-b bg-transparent">
              <Avatar className="h-12 w-12 dark:border dark:border-gray-300 shrink-0">
                <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium text-lg">
                  {getInitials(role.role_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0 overflow-hidden">
                <span className="text-base font-semibold truncate" title={role.role_name}>
                  {role.role_name}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
                <span className="text-sm truncate" title={role.description}>{role.description || <span className="text-muted-foreground italic text-xs">No description</span>}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</span>
                {permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {permissions.length > 3 ? (
                      <>
                        {permissions.slice(0, 3).map((item, idx) => (
                          <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-2 py-0.5 text-[10px]">
                            {item}
                          </Badge>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge asChild className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-1.5 py-0.5 text-[10px] inline-flex items-center justify-center transition-colors cursor-pointer">
                              <button type="button" aria-label="View all permissions">
                                <Ellipsis className="w-3 h-3" />
                              </button>
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="w-64 p-3 bg-popover text-popover-foreground border shadow-md rounded-lg">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">
                                All Permissions ({permissions.length})
                              </h4>
                              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pt-1 pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/25 hover:[&::-webkit-scrollbar-thumb]:bg-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent">
                                {permissions.map((item, idx) => (
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
                      permissions.map((item, idx) => (
                        <Badge key={`${item}-${idx}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-2 py-0.5 text-[10px]">
                          {item}
                        </Badge>
                      ))
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No permissions</span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-3 flex items-center justify-end border-t mt-auto bg-card">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onView(role)} title={`View Role`}>
                  <Eye className="h-4 w-4" />
                </Button>
                {role.canEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onEdit(role)} title={`Edit Role`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {role.canDelete && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#7b0d15] hover:text-[#ffd21a] dark:hover:bg-muted dark:hover:text-foreground transition-colors" onClick={() => onDelete(role.id)} title={`Delete Role`}>
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
