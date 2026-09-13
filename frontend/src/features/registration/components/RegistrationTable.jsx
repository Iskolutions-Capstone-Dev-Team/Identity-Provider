import { Eye, Pencil, Trash, FileText, Ellipsis } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IconStack } from "@/components/reui/icon-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

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

export default function RegistrationTable({ loading = false, rows = [], onView, onEdit, onDelete, showEditAction = true, showDeleteAction = true, colorMode = "light" }) {
  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col">
        <Frame spacing="xs">
          <FramePanel className="p-0!">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-1/3">Account Type</TableHead>
                  <TableHead className="w-1/3 text-center">Client List</TableHead>
                  <TableHead className="w-1/3 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6 p-5">
                      <div className="flex items-center justify-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                  <TableCell className="text-center p-5">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center p-5">
                    <div className="flex justify-center gap-2">
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
                <TableHead className="text-center w-1/3">Account Type</TableHead>
              <TableHead className="w-1/3 text-center">Client List</TableHead>
              <TableHead className="w-1/3 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex items-center justify-center w-full py-10">
                    <Empty className="max-w-md">
                      <EmptyHeader>
                        <EmptyMedia>
                          <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e] h-24 w-22">
                            <FileText className="text-[#7b0d15] dark:text-[#f8d24e] size-5" />
                          </IconStack>
                        </EmptyMedia>
                        <EmptyTitle>No account type found</EmptyTitle>
                        <EmptyDescription>
                          We couldn't find any account types matching your criteria.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => {
              const previewClientItems = getPreviewClientItems(row.clientNames);
              const remainingClientCount = getRemainingClientCount(row.totalClientCount);

              return (
                <TableRow key={row.accountType} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center justify-start gap-3">
                      <Avatar className="h-9 w-9 dark:border dark:border-gray-300">
                        <AvatarFallback className="bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] font-medium">
                          {getInitials(row.label)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{row.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.clientNames.length > 0 ? (
                      <div className="mx-auto max-w-[24rem]">
                        <div className="flex flex-wrap justify-center gap-2">
                          {previewClientItems.map((clientName, previewIndex) => (
                            <Badge key={`${row.accountType}-${clientName}-${previewIndex}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1 whitespace-normal break-words text-center">
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Menubar className="border-none bg-transparent shadow-none">
                        <MenubarMenu>
                          <MenubarTrigger className="cursor-pointer" aria-label={`Actions for ${row.label} registration settings`}>
                            <Ellipsis className="h-4 w-4" />
                          </MenubarTrigger>
                          <MenubarContent align="end">
                            <MenubarItem className="cursor-pointer gap-2" onClick={() => onView(row)}>
                              <Eye className="h-4 w-4" />
                              View
                            </MenubarItem>

                            {showEditAction && (
                              <MenubarItem className="cursor-pointer gap-2" onClick={() => onEdit(row)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </MenubarItem>
                            )}

                            {showDeleteAction && row.canDelete !== false && (
                              <MenubarItem className="cursor-pointer gap-2" onClick={() => onDelete(row)}>
                                <Trash className="h-4 w-4" />
                                Delete
                              </MenubarItem>
                            )}
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  </TableCell>
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
