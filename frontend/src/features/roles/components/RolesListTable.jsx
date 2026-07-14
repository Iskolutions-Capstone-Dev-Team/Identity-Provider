import { Skeleton } from "@/components/ui/skeleton";
import EmptySearchState from "../../../components/EmptySearchState";
import { ViewIcon, EditIcon, DeleteIcon } from "./roleIcons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash } from "lucide-react"

export default function RolesListTable({ loading = false, roles, onView, onEdit, onDelete, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const tableTheme = isDarkMode ? "userpoolDark" : "userpool";

  if (loading) {
    return (
      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Role Name</TableHead>
              <TableHead className="text-center">Description</TableHead>
              <TableHead className="text-center">Permissions</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
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
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Role Name</TableHead>
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center">Permissions</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <EmptySearchState message="No roles found" colorMode={colorMode} />
              </TableCell>
            </TableRow>
          )}

          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium text-center">
                {role.role_name}
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
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onView(role)} title={`View Role`}>
                    <Eye className="h-6 w-6" />
                  </Button>
                  
                  {role.canEdit && (
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onEdit(role)} title={`Edit Role`}>
                      <Pencil className="h-6 w-6" />
                    </Button>
                  )}
                  
                  {role.canDelete && (
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onDelete(role.id)} title={`Delete Role`}>
                      <Trash className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}