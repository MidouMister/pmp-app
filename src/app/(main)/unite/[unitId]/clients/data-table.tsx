"use client";

import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useModal } from "@/providers/modal-provider";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-model";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  actionButtonText,
  modalChildren,
}: DataTableProps<TData, TValue>) {
  const { setOpen } = useModal();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-4 shadow-sm">
        <div className="flex  items-center justify-center rounded-md bg-muted">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Rechercher un client par nom..."
          value={
            (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(filterValue)?.setFilterValue(event.target.value)
          }
          className="flex-1 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {(table.getColumn(filterValue)?.getFilterValue() as string) && (
          <div className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} résultat(s)
          </div>
        )}
        <Button
          onClick={() => {
            if (modalChildren) {
              setOpen(
                "add-client-modal",
                <CustomModal
                  modalId="add-client-modal"
                  title="Ajouter un Client"
                  subheading="Ajouter un nouveau client à votre Unité."
                >
                  {modalChildren}
                </CustomModal>
              );
            }
          }}
          className="flex items-center gap-2 bg-chart-4 hover:bg-chart-4/70 text-primary-foreground shadow-sm"
        >
          {actionButtonText} Client
        </Button>
      </div>

      <Card className=" p-1 bg-card shadow-md min-h-64">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border bg-background">
            <Table>
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="h-12 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  /* Enhanced empty state with better visual design */
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Aucun client trouvé
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Commencez par ajouter votre premier client
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Total: {table.getRowModel().rows.length} client(s)</div>
          <div>
            Affichage de {table.getFilteredRowModel().rows.length} sur{" "}
            {data.length} client(s)
          </div>
        </div>
      )}
    </div>
  );
}
