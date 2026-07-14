import EmptySearchState from "../../../components/EmptySearchState";
import { Eye, Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MAX_VISIBLE_CLIENT_SLOTS = 5;

function getPreviewClientItems(clientNames = []) {
  const normalizedClientNames = Array.isArray(clientNames) ? clientNames : [];
  return normalizedClientNames.slice(0, MAX_VISIBLE_CLIENT_SLOTS);
}

function getRemainingClientCount(totalClientCount = 0) {
  return Math.max(0, totalClientCount - MAX_VISIBLE_CLIENT_SLOTS);
}

export default function RegistrationTable({ rows = [], onView, onEdit, onDelete, showEditAction = true, showDeleteAction = true, colorMode = "light" }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 text-center">Account Type</TableHead>
              <TableHead className="w-1/3 text-center">Client List</TableHead>
              <TableHead className="w-1/3 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <EmptySearchState message="No account type found" colorMode={colorMode} />
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => {
              const previewClientItems = getPreviewClientItems(row.clientNames);
              const remainingClientCount = getRemainingClientCount(row.totalClientCount);

              return (
                <TableRow key={row.accountType} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-medium">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.clientNames.length > 0 ? (
                      <div className="mx-auto max-w-[24rem]">
                        <div className="flex flex-wrap justify-center gap-2">
                          {previewClientItems.map((clientName, previewIndex) => (
                            <Badge key={`${row.accountType}-${clientName}-${previewIndex}`} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">
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
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onView(row)} title={`View ${row.label} registration settings`}>
                        <Eye className="h-6 w-6" />
                      </Button>

                      {showEditAction && (
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onEdit(row)} title={`Edit ${row.label} registration settings`}>
                          <Pencil className="h-6 w-6" />
                        </Button>
                      )}

                      {showDeleteAction && row.canDelete !== false && (
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-black hover:bg-[#7b0d15] hover:text-white dark:text-white dark:hover:bg-[#f8d24e] dark:hover:text-[#7b0d15] transition-colors" onClick={() => onDelete(row)} title={`Delete ${row.label} registration settings`}>
                          <Trash className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}