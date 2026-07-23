import { Skeleton } from "@/components/ui/skeleton";
import { ViewIcon, EditIcon, DeleteIcon } from "./roleIcons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash, ShieldUser } from "lucide-react"
import { Frame, FramePanel } from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";

function getInitials(text) {
  if (!text) return "R";
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}

export default function RolesListTable({ loading = false, roles, onView, onEdit, onDelete, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const tableTheme = isDarkMode ? "userpoolDark" : "userpool";

  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col">
        <Frame spacing="xs">
          <FramePanel className="p-0!">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[25%]">Role Name</TableHead>
              <TableHead className="text-center">Description</TableHead>
              <TableHead className="text-center">Permissions</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center justify-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-48 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1 w-full max-w-[24rem] mx-auto">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
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
    <div className="mx-auto flex w-full flex-col">
      <Frame spacing="xs">
        <FramePanel className="p-0!">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[25%]">Role Name</TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Permissions</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
        </TableHeader>

        <TableBody>
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <div className="flex items-center justify-center w-full py-10">
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
              </TableCell>
            </TableRow>
          )}

          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="pl-6 font-medium">
                <div className="flex items-center justify-start gap-3">
                  <Avatar className="h-9 w-9 dark:border dark:border-gray-300">
                    <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium">
                      {getInitials(role.role_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{role.role_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{role.description}</TableCell>
              <TableCell className="text-center">
                {!Array.isArray(role.permissionLabels) || role.permissionLabels.length === 0 ? (
                  <span className="text-muted-foreground italic text-sm">No permissions</span>
                ) : (
                  <div className="flex flex-wrap justify-center gap-1 w-full max-w-[24rem] mx-auto">
                    {role.permissionLabels.map((permission) => (
                      <Badge key={permission} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
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