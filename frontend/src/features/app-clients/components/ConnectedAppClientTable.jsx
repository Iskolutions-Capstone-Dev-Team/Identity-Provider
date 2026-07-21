import EmptySearchState from "../../../components/EmptySearchState";
import { KeyRound, Eye, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getClientId = (client) => client?.id ?? client?.clientId ?? "";

function renderActionButton({ label, onClick, children, className }) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
}

export default function ConnectedAppClientTable({ 
  loading = false, 
  clients, 
  onView, 
  onEdit, 
  onDelete, 
  onRotateSecret, 
  showEditAction = true, 
  showDeleteAction = true, 
  showRotateSecretAction = true, 
  colorMode = "light" 
}) {
  const isDarkMode = colorMode === "dark";

  const emptyStateClassName = isDarkMode
    ? "px-6 py-16 text-center text-sm text-[#bda8af]"
    : "px-6 py-16 text-center text-sm text-[#8f6f76]";
    
  const actionButtonClassName = "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col">
        <Frame spacing="xs">
          <FramePanel className="p-0!">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 w-[30%]">Client Name</TableHead>
                  <TableHead className="text-center w-[25%]">Created</TableHead>
                  <TableHead className="text-center w-[20%]">Secret</TableHead>
                  <TableHead className="text-center w-[25%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
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
                <TableHead className="text-center pl-4 w-[30%]">Client Name</TableHead>
                <TableHead className="text-center w-[25%]">Created</TableHead>
                <TableHead className="text-center w-[20%]">Secret</TableHead>
                <TableHead className="text-center w-[25%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className={emptyStateClassName}>
                    <EmptySearchState message="No app clients found" colorMode={colorMode} />
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => {
                  const imageSrc = client.image ? (client.image.startsWith("data:") ? client.image : `${client.image}`) : undefined;
                  
                  return (
                    <TableRow key={client.clientId || client.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 dark:border dark:border-gray-300">
                            <AvatarImage src={imageSrc} alt={client.name} className="object-cover" />
                            <AvatarFallback className="bg-[#7b0d15] text-[#ffd21a] dark:bg-white dark:text-black font-medium">
                              {(client.name || "A").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">
                              {client.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {client.id || client.clientId}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {client.created}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {showRotateSecretAction ? (
                            renderActionButton({
                              label: `Rotate secret for ${client.name}`,
                              onClick: () =>
                                onRotateSecret?.({
                                  id: getClientId(client),
                                  name: client.name,
                                }),
                              className: actionButtonClassName,
                              children: (<KeyRound className="h-4 w-4" />),
                            })
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderActionButton({
                            label: `View ${client.name}`,
                            onClick: () => onView?.(client),
                            className: actionButtonClassName,
                            children: (<Eye className="h-4 w-4" />),
                          })}

                          {showEditAction &&
                            renderActionButton({
                              label: `Edit ${client.name}`,
                              onClick: () => onEdit?.(client),
                              className: actionButtonClassName,
                              children: (<Pencil className="h-4 w-4" />),
                            })}

                          {showDeleteAction &&
                            renderActionButton({
                              label: `Delete ${client.name}`,
                              onClick: () => onDelete?.(client),
                              className: actionButtonClassName,
                              children: (<Trash2 className="h-4 w-4" />),
                            })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </FramePanel>
      </Frame>
    </div>
  );
}