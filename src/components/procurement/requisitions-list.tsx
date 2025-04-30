import { useState, useMemo, useEffect } from 'react'
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
  FilterFn,
  SortingFn,
  sortingFns,
} from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { 
  Plus,
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Trash2 
} from 'lucide-react'
import { useRequisitions, useDeleteRequisitions } from '../../renderer/hooks/useProcurement'
import { useWorkflowByAction } from '../../renderer/hooks/useWorkflow'
import type { Requisition, RequisitionStatus, ProcurementType } from '../../shared/types'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { RequisitionFormDialog } from './requisition-form-dialog'
import { useToast, Toast } from '../../hooks/use-toast'

// Define ToastProps interface locally if Toast type is not exported or doesn't match
interface LocalToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactElement;
  duration?: number;
}

// Default status config (fallback if workflow hook fails)
const defaultStatusConfig = {
  colors: {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'manager_approval': 'bg-amber-100 text-amber-800',
    'finance_approval': 'bg-purple-100 text-purple-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800',
    'converted': 'bg-indigo-100 text-indigo-800'
  },
  labels: {
    'draft': 'Entwurf',
    'submitted': 'Eingereicht',
    'manager_approval': 'Manager-Freigabe',
    'finance_approval': 'Finanz-Freigabe',
    'approved': 'Genehmigt',
    'rejected': 'Abgelehnt',
    'cancelled': 'Storniert',
    'converted': 'Konvertiert'
  }
};

// Default type config
const defaultTypeConfig = {
  colors: {
    'material': 'bg-purple-100 text-purple-800',
    'service': 'bg-orange-100 text-orange-800',
    'asset': 'bg-indigo-100 text-indigo-800'
  },
  labels: {
    'material': 'Material',
    'service': 'Dienstleistung',
    'asset': 'Anlage'
  }
};

// Reverted basic string filter
const basicFilter: FilterFn<any> = (row, columnId, value) => {
  return String(row.getValue(columnId)).toLowerCase().includes(String(value).toLowerCase());
}

export function RequisitionsList() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: requisitions = [], isLoading } = useRequisitions()
  const deleteRequisitionsMutation = useDeleteRequisitions()
  const { data: workflow } = useWorkflowByAction('procurement-requisition')
  const { toast } = useToast()
  const navigate = useNavigate()

  // Memoize status config based on workflow data
  const statusConfig = useMemo(() => {
    if (workflow?.steps) {
      const colors: Record<string, string> = {};
      const labels: Record<string, string> = {};
      workflow.steps.forEach(step => {
        // Simple background/text color generation from hex (adjust as needed)
        // This is basic, a better approach might involve pre-defined Tailwind classes or a utility
        const bgColor = `${step.color}20`; // Add alpha transparency
        // Basic text color determination (improve if needed)
        const textColor = step.color;
        colors[step.name.toLowerCase()] = `bg-[${bgColor}] text-[${textColor}]`; // Use arbitrary values
        labels[step.name.toLowerCase()] = step.name;
      });
      return { colors, labels };
    } else {
      // Fallback to defaults if workflow is not available
      return defaultStatusConfig;
    }
  }, [workflow]);

  // Memoize type config (remains static for now)
  const typeConfig = useMemo(() => defaultTypeConfig, []);

  const columns = useMemo<ColumnDef<Requisition>[]>(
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
        accessorKey: 'title',
        header: 'Titel',
        filterFn: 'includesString',
      },
      {
        accessorKey: 'requesterName',
        header: 'Anforderer',
        filterFn: 'includesString',
      },
      {
        accessorKey: 'department',
        header: 'Abteilung',
        cell: ({ row }) => <Badge variant="secondary">{row.original.department}</Badge>,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'procurementType',
        header: 'Art',
        cell: ({ row }) => {
          const type = row.getValue('procurementType') as ProcurementType
          return (
            <Badge className={typeConfig.colors[type] || 'bg-gray-100 text-gray-800'}>
              {typeConfig.labels[type] || type}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priorität',
        cell: ({ row }) => {
          const priorityColors: Record<string, string> = {
            'low': 'bg-green-100 text-green-800',
            'normal': 'bg-blue-100 text-blue-800',
            'high': 'bg-red-100 text-red-800'
          }
          
          const priorityLabels: Record<string, string> = {
            'low': 'Niedrig',
            'normal': 'Normal',
            'high': 'Hoch'
          }
          
          const priority = row.getValue('priority') as string
          return (
            <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>
              {priorityLabels[priority] || priority}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as RequisitionStatus
          const colors = statusConfig.colors as Record<RequisitionStatus, string>;
          const labels = statusConfig.labels as Record<RequisitionStatus, string>;
          const workflowColor = workflow?.steps.find(s => s.name.toLowerCase() === status)?.color;

          return (
            <Badge
              className={colors[status] || defaultStatusConfig.colors['draft']}
              style={ workflowColor ? {
                backgroundColor: `${workflowColor}20`,
                color: workflowColor
              } : {}}
            >
              {labels[status] || status}
            </Badge>
          )
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'createdAt',
        header: 'Erstellt am',
        cell: ({ row }) => {
          return new Date(row.getValue('createdAt')).toLocaleDateString()
        },
      },
    ],
    [statusConfig, typeConfig, workflow]
  )

  const table = useReactTable({
    data: requisitions,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: basicFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  })

  const handleExportSelected = () => {
    const selectedRequisitions = Object.keys(rowSelection).map(
      (idx) => requisitions[parseInt(idx)]
    )
    // Implement export logic
    toast({
      title: 'Export gestartet',
      description: `${selectedRequisitions.length} Anforderungen werden exportiert.`,
    })
  }

  const handleBulkDelete = async () => {
    try {
      const selectedIds = table.getSelectedRowModel().flatRows.map(row => row.original.id);
      if (selectedIds.length === 0) return;

      await deleteRequisitionsMutation.mutateAsync(selectedIds)
      setRowSelection({})
      toast({
        title: 'Anforderungen gelöscht',
        description: `${selectedIds.length} Anforderungen wurden erfolgreich gelöscht.`,
      })
    } catch (error) {
      // Use the corrected ToastProps interface or imported type
      toast({
        title: 'Fehler',
        description: 'Anforderungen konnten nicht gelöscht werden.',
        // Assuming 'variant' is directly available on the argument type now
        variant: 'destructive', 
      } as Toast) // Use type assertion if needed
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Bestellanforderungen</h2>
          <p className="text-muted-foreground">
            Verwalten Sie hier Ihre internen Beschaffungsanfragen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Neue Anforderung
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Suche..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="sm:max-w-[300px]"
        />
      </div>

      {/* Batch Actions */}
      {table.getSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 py-4">
          <p className="text-sm text-muted-foreground">
            {table.getSelectedRowModel().rows.length} Anforderung(en) ausgewählt
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
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? "cursor-pointer select-none flex items-center" : "flex items-center"}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 h-4 w-4" />,
                          desc: <ChevronDown className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
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
                  Keine Anforderungen gefunden.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => {
                    navigate({ 
                      to: '/procurement/requisitions/$requisitionId',
                      params: { requisitionId: row.original.id }
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

      {/* Create Requisition Dialog */}
      <RequisitionFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}