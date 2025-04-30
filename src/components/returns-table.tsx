import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  VisibilityState,
} from '@tanstack/react-table'
import {
  Package,
  CheckCircle,
  Clock,
  CreditCard,
  Truck,
  Box,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  Calendar,
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { 
  ReturnItem, 
  ReturnStatus, 
  FollowUpAction,
  StatusWorkflow,
  StatusStep
} from '../shared/types'
import { BatchActions } from './batch-actions'
import { format, isValid, parseISO } from 'date-fns'
import { ReturnFormModal } from './return-form-modal'
import { ReturnDetailsDialog } from './return-details-dialog'
import { useUpdateReturn, useAddReturnNote, useReturns } from '../renderer/hooks/useReturns.ts'
import { API_BASE_URL } from '../shared/config'
import { useWorkflowByAction } from '../renderer/hooks/useSettings'
import { StatCard } from './ui/stat-card'

// Define interfaces for credit note and reconciliation data
interface CreditNoteData {
  amount: number;
  originalInvoiceNumber: string;
  creditorNumber: string;
}

interface ReconciliationData {
  invoiceNumber: string;
  date: string;
}

// Helper function to format dates
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'dd.MM.yyyy') : 'Ungültiges Datum'
}

// Replace the hardcoded getStatusIcon function with a more flexible approach
const getStatusIndicator = (status: string, color: string) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span>{statusLabels[status as keyof typeof statusLabels] || status}</span>
    </div>
  );
};

// Keep the statusLabels for text display
const statusLabels: Record<ReturnStatus, string> = {
  'ausstehend': 'Ausstehend',
  'beauftragt': 'Beauftragt',
  'versandt': 'Versandt',
  'abgeschlossen': 'Abgeschlossen',
  'gutgeschrieben': 'Gutgeschrieben'
};

// Mapping from column ID to German display name
const columnDisplayNames: Record<string, string> = {
  status: 'Status',
  orderNumber: 'Bestellnummer',
  supplierReference: 'Lieferantenreferenz',
  followUpAction: 'Aktion',
  commissioningDate: 'Beauftragt',
  creditNoteNumber: 'Gutschrift',
  shippingDate: 'Versandt',
};

// Mapping of FollowUpAction to color classes
const colors: Record<FollowUpAction, string> = {
  gutschrift: 'bg-green-100 text-green-800',
  ersatz: 'bg-blue-100 text-blue-800',
  reparatur: 'bg-yellow-100 text-yellow-800',
  ausschuss: 'bg-red-100 text-red-800',
  procurement: 'bg-purple-100 text-purple-800'
}

// New component for rendering the status cell
interface StatusCellProps {
  status: ReturnStatus;
  followUpAction: FollowUpAction;
}

const StatusCell: React.FC<StatusCellProps> = ({ status, followUpAction }) => {
  // Call the hook correctly within this component
  const { data: workflow } = useWorkflowByAction(followUpAction);

  // Find the current step in the workflow to get its color (case-insensitive)
  const currentStep = workflow?.steps?.find((step: StatusStep) =>
    step.name.toLowerCase() === status?.toLowerCase()
  );
  const statusColor = currentStep?.color || '#6b7280'; // Default gray if no color defined

  return getStatusIndicator(status, statusColor);
};

// Main component for the returns table
export function ReturnsTable() {
  // Replace loader data with useReturns hook
  const { data: returns = [], isLoading } = useReturns();
  console.log('ReturnsTable: Rendering with returns:', returns);

  // State variables for sorting, filtering, visibility, and row selection
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [showColumnSettings, setShowColumnSettings] = React.useState(false)
  const [selectedReturn, setSelectedReturn] = React.useState<ReturnItem | null>(null)
  const [dateRange, setDateRange] = React.useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' })

  // Get route data and mutations
  const updateReturnMutation = useUpdateReturn();
  const addNoteMutation = useAddReturnNote();

  // Calculate total, pending, and completed returns
  const totalReturns = returns.length
  const pendingReturns = returns.filter((item: ReturnItem) => item.status === 'ausstehend').length
  const completedReturns = returns.filter((item: ReturnItem) => item.status === 'abgeschlossen').length

  // Column definitions for the react-table
  const columns: ColumnDef<ReturnItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        // Use the new StatusCell component
        return (
          <StatusCell
            status={row.original.status}
            followUpAction={row.original.followUpAction}
          />
        );
      }
    },
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Bestellnummer
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue('orderNumber') || 'N/A',
    },
    {
      accessorKey: 'supplierReference',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Lieferantenreferenz
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue('supplierReference') || 'N/A',
    },
    {
      accessorKey: 'followUpAction',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Aktion
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => {
        const action = row.getValue('followUpAction') as FollowUpAction
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[action]}`}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </span>
        )
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'commissioningDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Beauftragt
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.original.commissioningDate),
      filterFn: (row, _id, value: [string, string]) => {
        const date = row.original.commissioningDate
        if (!date || !value[0]) return true
        const cellDate = parseISO(date)
        const fromDate = value[0] ? parseISO(value[0]) : null
        const toDate = value[1] ? parseISO(value[1]) : null
        if (fromDate && toDate) {
          return cellDate >= fromDate && cellDate <= toDate
        }
        return true
      },
    },
    {
      accessorKey: 'creditNoteNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Gutschrift
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original
        if (!item.creditNoteNumber) return null
        return (
          <div className="space-y-1">
            <div className="font-medium">{item.creditNoteNumber}</div>
            {item.creditAmount && (
              <div className="text-sm text-muted-foreground">
                €{item.creditAmount.toFixed(2)}
              </div>
            )}
            {item.reconciliationInvoiceNumber && (
              <div className="text-xs text-muted-foreground">
                Abgestimmt: {item.reconciliationInvoiceNumber}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'shippingDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-transparent"
          >
            Versandt
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.original.shippingDate),
    },
  ]

  // Initialize react-table
  const table = useReactTable({
    data: returns,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  console.log('ReturnsTable: Table row model:', table.getRowModel().rows);

  // Function to handle updating return fields
  const handleUpdateReturnFields = async (returnId: string, updates: Partial<ReturnItem>) => {
    try {
      const { status, ...fieldUpdates } = updates;
      
      if (Object.keys(fieldUpdates).length > 0) {
        await updateReturnMutation.mutateAsync({ id: returnId, returnData: fieldUpdates });
        
        if (selectedReturn && selectedReturn.id === returnId) {
          setSelectedReturn(prev => ({
            ...prev!,
            ...fieldUpdates
          }));
        }
      }
      
      if (status) {
        await updateReturnMutation.mutateAsync({ id: returnId, returnData: { status } });
        
        if (selectedReturn && selectedReturn.id === returnId) {
          setSelectedReturn(prev => ({
            ...prev!,
            status
          }));
        }
      }
    } catch (error) {
      console.error('ReturnsTable: Field update failed:', error);
      throw error;
    }
  };

  // Add loading state handling
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard cards */}
      <div className="card-dashboard">
        <div className="p-4 border-b border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <StatCard
              title="Gesamt"
              value={totalReturns}
              icon={Package}
              iconColor="primary"
            />
            <StatCard
              title="Ausstehend"
              value={pendingReturns}
              icon={Clock}
              iconColor="warning"
            />
            <StatCard
              title="Abgeschlossen"
              value={completedReturns}
              icon={CheckCircle}
              iconColor="success"
            />
          </div>

          {/* Table header with actions and filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Retourenanfragen</h2>
              <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} von {table.getFilteredRowModel().rows.length} ausgewählt
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <BatchActions
                selectedReturns={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
                onUpdateStatus={async (ids, status) => {
                  // Update each return one by one
                  await Promise.all(ids.map(id => 
                    updateReturnMutation.mutateAsync({ 
                      id, 
                      returnData: { status } 
                    })
                  ));
                }}
              />
              <ReturnFormModal
                onSubmit={async (data) => {
                  const result = await updateReturnMutation.mutateAsync({
                    id: data.id || '',
                    returnData: {
                      ...data,
                      status: 'ausstehend'
                    }
                  });
                  return result as ReturnItem;
                }}
              />
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Bestellnummer suchen..."
                  value={(table.getColumn('orderNumber')?.getFilterValue() as string) ?? ''}
                  onChange={(event) =>
                    table.getColumn('orderNumber')?.setFilterValue(event.target.value)
                  }
                  className="pl-9 w-[200px] sm:w-[300px]"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="relative"
              >
                {showColumnSettings ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Column visibility settings */}
        {showColumnSettings && (
          <div className="px-6 py-4 border-b border-border/40 bg-muted/50">
            <h3 className="text-sm font-medium mb-3">Spalten anzeigen/ausblenden</h3>
            <div className="flex flex-wrap gap-2">
              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <Button
                      key={column.id}
                      variant={column.getIsVisible() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => column.toggleVisibility()}
                      className="h-7"
                    >
                      {/* Use German display name from mapping */}
                      {columnDisplayNames[column.id] || column.id}
                    </Button>
                  )
                })}
            </div>
          </div>
        )}

        {/* Column filters */}
        <div className="border-b border-border/40">
          <div className="flex flex-wrap gap-4 p-6">
            {table.getColumn('status') && (
              <select
                value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('status')?.setFilterValue(
                    event.target.value === '' ? undefined : event.target.value
                  )
                }
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:ring-1 focus:ring-ring"
              >
                <option value="">Alle Stati</option>
                <option value="ausstehend">Ausstehend</option>
                <option value="beauftragt">Beauftragt</option>
                <option value="versandt">Versandt</option>
                <option value="gutgeschrieben">Gutgeschrieben</option>
                <option value="abgeschlossen">Abgeschlossen</option>
              </select>
            )}
            {table.getColumn('followUpAction') && (
              <select
                value={(table.getColumn('followUpAction')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('followUpAction')?.setFilterValue(
                    event.target.value === '' ? undefined : event.target.value
                  )
                }
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:ring-1 focus:ring-ring"
              >
                <option value="">Alle Aktionen</option>
                <option value="gutschrift">Gutschrift</option>
                <option value="ersatz">Ersatz</option>
                <option value="reparatur">Reparatur</option>
                <option value="ausschuss">Ausschuss</option>
              </select>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, from: e.target.value }))
                  table.getColumn('commissioningDate')?.setFilterValue([e.target.value, dateRange.to])
                }}
                className="h-9 w-[150px]"
              />
              <span className="text-muted-foreground">bis</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, to: e.target.value }))
                  table.getColumn('commissioningDate')?.setFilterValue([dateRange.from, e.target.value])
                }}
                className="h-9 w-[150px]"
              />
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/40">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left font-medium text-muted-foreground bg-muted/50"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReturn(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-muted-foreground">
                    Keine Retouren gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-4 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Vorherige
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Nächste
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm focus:ring-1 focus:ring-ring"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Return details dialog */}
      {selectedReturn && (
        <ReturnDetailsDialog
          returnItem={selectedReturn}
          open={true}
          onClose={() => setSelectedReturn(null)}
          onUpdateStatus={async (ids: string | string[], status: ReturnStatus) => {
            if (Array.isArray(ids)) {
              await Promise.all(ids.map(id => 
                updateReturnMutation.mutateAsync({ id, returnData: { status } })
              ));
            } else {
              await updateReturnMutation.mutateAsync({ id: ids, returnData: { status } });
            }
          }}
          onAddNote={(returnId: string, note: string) => {
            return addNoteMutation.mutateAsync({ 
              id: returnId, 
              content: note,
              author: 'System' // TODO: Get actual user
            });
          }}
          onCreateCreditNote={async (returnId: string, creditData: CreditNoteData) => {
            await updateReturnMutation.mutateAsync({
              id: returnId,
              returnData: {
                creditAmount: creditData.amount,
                originalInvoiceNumber: creditData.originalInvoiceNumber,
                creditorNumber: creditData.creditorNumber,
                creditNoteStatus: 'erstellt'
              }
            });
          }}
          onReconcileCreditNote={async (returnId: string, reconciliationData: ReconciliationData) => {
            await updateReturnMutation.mutateAsync({
              id: returnId,
              returnData: {
                reconciliationInvoiceNumber: reconciliationData.invoiceNumber,
                reconciliationDate: reconciliationData.date,
                creditNoteStatus: 'abgestimmt'
              }
            });
          }}
          onAddDocument={undefined}
          onDeleteDocument={undefined}
          onUpdateReturnFields={handleUpdateReturnFields}
          apiUrl={API_BASE_URL}
        />
      )}
    </>
  );
}
