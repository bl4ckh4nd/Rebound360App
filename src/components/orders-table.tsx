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
  ShoppingCart,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  TruckIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Order, OrderStatus } from '@/shared/types'
import { format, isValid, parseISO } from 'date-fns'
import { OrderDetailsDialog } from '@/components/order-details-dialog'
import { useOrders, useCreateReturnFromOrder } from '@/renderer/hooks/useOrders'
import { CreateReturnFromOrderData } from '@/shared/types'

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'dd.MM.yyyy') : 'Ungültiges Datum'
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'geliefert':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'bestellt':
      return <Clock className="w-5 h-5 text-yellow-500" />
    case 'teilgeliefert':
      return <TruckIcon className="w-5 h-5 text-blue-500" />
    case 'storniert':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    default:
      return <Clock className="w-5 h-5 text-gray-500" />
  }
}

const displayStatus: Record<OrderStatus, string> = {
  bestellt: 'Bestellt',
  geliefert: 'Geliefert',
  teilgeliefert: 'Teilweise geliefert',
  storniert: 'Storniert'
}

export function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [showColumnSettings, setShowColumnSettings] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  
  // Use the useOrders hook instead of useLoaderData
  const { data: orders = [], isLoading } = useOrders()
  const createReturnMutation = useCreateReturnFromOrder()

  const handleCreateReturn = (returnDataFromModal: {
    orderId: number // Original Order JTL ID (number)
    products: { jtl_id: number, quantity: number, reason: string }[]
    workflow_id?: string
    status?: string
    followUpAction: 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss'
  }) => {
    // Data now matches CreateReturnFromOrderData expected by the hook
    const mutationData: CreateReturnFromOrderData = {
      orderId: returnDataFromModal.orderId,
      products: returnDataFromModal.products.map(p => ({ // Ensure structure matches if needed
        jtl_id: p.jtl_id,
        quantity: p.quantity,
        reason: p.reason
      })),
      followUpAction: returnDataFromModal.followUpAction,
      workflow_id: returnDataFromModal.workflow_id,
      status: returnDataFromModal.status
    };
    
    console.log('Creating return with mutation data:', mutationData); 
    createReturnMutation.mutate(mutationData, {
      onSuccess: (newReturn) => {
        console.log('Return created successfully:', newReturn);
        setSelectedOrder(null); // Close the details dialog
        // Optionally show a success notification
      },
      onError: (error) => {
        console.error('Failed to create return:', error);
        // Optionally show an error message to the user
      }
    });
  }

  const columns: ColumnDef<Order>[] = [
    {
      id: 'orderNumber',
      header: 'Bestellnummer',
      accessorKey: 'orderNumber',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('orderNumber')}</div>
      ),
    },
    {
      id: 'supplierName',
      header: 'Lieferant',
      accessorKey: 'supplierName',
    },
    {
      id: 'supplierReference',
      header: 'Referenz',
      accessorKey: 'supplierReference',
      cell: ({ row }) => (
        <div>{row.getValue('supplierReference') || 'Nicht angegeben'}</div>
      ),
    },
    {
      id: 'orderDate',
      header: 'Bestelldatum',
      accessorKey: 'orderDate',
      cell: ({ row }) => formatDate(row.getValue('orderDate')),
    },
    {
      id: 'deliveryDate',
      header: 'Lieferdatum',
      accessorKey: 'deliveryDate',
      cell: ({ row }) => formatDate(row.getValue('deliveryDate')),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.getValue('status') as OrderStatus
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span>{displayStatus[status]}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Opening details for order:", order); // Log selected order
                setSelectedOrder(order);
              }}
            >
              <Eye className="h-4 w-4" />
              Details
            </Button>
            {(order.status === 'geliefert' || order.status === 'teilgeliefert') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(order)}
              >
                <ShoppingCart className="h-4 w-4" />
                Retoure
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalOrders = orders.length
  const deliveredOrders = orders.filter(order => order.status === 'geliefert').length
  const partiallyDeliveredOrders = orders.filter(order => order.status === 'teilgeliefert').length
  const orderedOrders = orders.filter(order => order.status === 'bestellt').length
  const cancelledOrders = orders.filter(order => order.status === 'storniert').length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geliefert</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teilgeliefert</CardTitle>
            <TruckIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partiallyDeliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestellt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storniert</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Nach Bestellnummer oder Lieferant suchen..."
          value={(table.getColumn('orderNumber')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('orderNumber')?.setFilterValue(event.target.value)
            table.getColumn('supplierName')?.setFilterValue(event.target.value)
          }}
          className="max-w-sm"
        />

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

      {showColumnSettings && (
        <div className="px-6 py-4 border-b border-border/40 bg-muted/50">
          <h3 className="text-sm font-medium mb-3">Spalten anzeigen/ausblenden</h3>
          <div className="flex flex-wrap gap-2">
            {table
              .getAllColumns()
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
                    {column.columnDef.header as React.ReactNode}
                  </Button>
                )
              })}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
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
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-sm text-gray-500"
                >
                  Keine Bestellungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} von{' '}
          {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Zurück
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter
          </Button>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCreateReturn={handleCreateReturn}
        />
      )}
    </div>
  )
}