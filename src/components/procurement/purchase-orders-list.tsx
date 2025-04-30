import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate } from '@tanstack/react-router';
import { 
  Plus, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Trash2 
} from 'lucide-react';
import { usePurchaseOrders, useDeletePurchaseOrders } from '../../renderer/hooks/useProcurement';
import type { PurchaseOrder } from '../../shared/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { PurchaseOrderFormDialog } from './purchase-order-form-dialog';
import { useToast } from '../../hooks/use-toast';

export function PurchaseOrdersList() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = usePurchaseOrders();
  const deleteOrdersMutation = useDeletePurchaseOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Status display configuration
  const statusColors: Record<PurchaseOrder['status'], string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'acknowledged': 'bg-amber-100 text-amber-800',
    'partially_received': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const statusLabels: Record<PurchaseOrder['status'], string> = {
    'draft': 'Entwurf',
    'sent': 'Gesendet',
    'acknowledged': 'Bestätigt',
    'partially_received': 'Teilweise erhalten',
    'completed': 'Abgeschlossen',
    'cancelled': 'Storniert'
  };

  const typeColors: Record<string, string> = {
    'standard': 'bg-gray-100 text-gray-800',
    'express': 'bg-red-100 text-red-800',
    'international': 'bg-indigo-100 text-indigo-800',
    'material': 'bg-emerald-100 text-emerald-800'
  };

  const typeLabels: Record<string, string> = {
    'standard': 'Standard',
    'express': 'Express',
    'international': 'International',
    'material': 'Material'
  };

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: 'Bestellnummer',
      },
      {
        accessorKey: 'title',
        header: 'Titel',
      },
      {
        accessorKey: 'procurementType',
        header: 'Art',
        cell: ({ row }) => {
          const type = row.getValue('procurementType') as string;
          return (
            <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
              {typeLabels[type] || type}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value === '' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as PurchaseOrder['status'];
          return (
            <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
              {statusLabels[status] || status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value === '' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Betrag',
        cell: ({ row }) => {
          const amount = row.getValue('totalAmount') as number;
          const formatted = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }).format(amount);
          return formatted;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Erstellt am',
        cell: ({ row }) => {
          return new Date(row.getValue('createdAt')).toLocaleDateString();
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleExportSelected = () => {
    const selectedOrders = Object.keys(rowSelection).map(
      (idx) => orders[parseInt(idx)]
    );
    // Implement export logic
    toast({
      title: 'Export gestartet',
      description: `${selectedOrders.length} Bestellungen werden exportiert.`,
    });
  };

  const handleBulkDelete = async () => {
    try {
      const selectedIds = Object.keys(rowSelection).map(
        (idx) => orders[parseInt(idx)].id
      );
      await deleteOrdersMutation.mutateAsync(selectedIds);
      setRowSelection({});
      toast({
        title: 'Bestellungen gelöscht',
        description: `${selectedIds.length} Bestellungen wurden erfolgreich gelöscht.`,
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Bestellungen konnten nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Beschaffungsaufträge</h2>
          <p className="text-muted-foreground">
            Verwalten Sie hier Ihre Bestellungen für die interne Beschaffung.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Neue Bestellung
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Suche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-[300px]"
        />
      </div>

      {/* Batch Actions */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 py-4">
          <p className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} Bestellung(en) ausgewählt
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="w-4 h-4 mr-2" />
              Exportieren
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Löschen
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          header.column.getIsSorted() === "asc" ? 
                            <ChevronUp className="ml-2 h-4 w-4 inline" /> : 
                            <ChevronDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Laden...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Keine Bestellungen gefunden.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id} 
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => {
                    navigate({ 
                      to: '/procurement/orders/$orderId',
                      params: { orderId: row.original.id }
                    })
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === 'select') {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Zeige {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} bis{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          von {table.getFilteredRowModel().rows.length} Einträgen
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Purchase Order Dialog */}
      <PurchaseOrderFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}