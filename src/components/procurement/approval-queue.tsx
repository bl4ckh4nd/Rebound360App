import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '../ui/button';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useRequisitions } from '../../renderer/hooks/useProcurement';
import type { Requisition, RequisitionStatus } from '../../shared/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';

export function ApprovalQueue() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | ''>('');
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    requisition: Requisition | null;
    action: 'approve' | 'reject' | null;
    bulk?: boolean;
    count?: number;
  }>({ open: false, requisition: null, action: null });
  const [comment, setComment] = useState('');
  const [selectedRequisitions, setSelectedRequisitions] = useState<string[]>([]);
  
  const { data: requisitions = [], isLoading } = useRequisitions();

  // Filter requisitions that need approval
  const pendingApprovals = useMemo(() => {
    return requisitions.filter(req => 
      ['submitted', 'manager_approval', 'finance_approval'].includes(req.status)
    );
  }, [requisitions]);

  // Define table columns
  const columns = useMemo<ColumnDef<Requisition>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: 'Titel',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-gray-500 mt-1 line-clamp-1">{row.original.description}</div>
          </div>
        ),
      },
      {
        accessorKey: 'requesterName',
        header: 'Anforderer',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.requesterName}</div>
            <div className="text-sm text-gray-500">{row.original.department}</div>
          </div>
        ),
      },
      {
        accessorKey: 'procurementType',
        header: 'Art',
        cell: ({ row }) => {
          const typeColors: Record<string, string> = {
            material: 'bg-purple-100 text-purple-800',
            service: 'bg-orange-100 text-orange-800',
            asset: 'bg-indigo-100 text-indigo-800',
          };
          
          const typeLabels: Record<string, string> = {
            material: 'Material',
            service: 'Dienstleistung',
            asset: 'Anlage',
          };
          
          return (
            <Badge className={typeColors[row.original.procurementType]}>
              {typeLabels[row.original.procurementType]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priorität',
        cell: ({ row }) => {
          const priorityColors: Record<string, string> = {
            low: 'bg-green-100 text-green-800',
            normal: 'bg-blue-100 text-blue-800',
            high: 'bg-red-100 text-red-800',
          };
          
          const priorityLabels: Record<string, string> = {
            low: 'Niedrig',
            normal: 'Normal',
            high: 'Hoch',
          };
          
          return (
            <Badge className={priorityColors[row.original.priority]}>
              {priorityLabels[row.original.priority]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors: Record<string, string> = {
            submitted: 'bg-amber-100 text-amber-800',
            manager_approval: 'bg-blue-100 text-blue-800',
            finance_approval: 'bg-purple-100 text-purple-800',
          };
          
          const statusLabels: Record<string, string> = {
            submitted: 'Eingereicht',
            manager_approval: 'Manager-Freigabe',
            finance_approval: 'Finanz-Freigabe',
          };
          
          return (
            <Badge className={statusColors[row.original.status]}>
              {statusLabels[row.original.status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Betrag',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.totalAmount.toFixed(2)} €</div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Warte seit',
        cell: ({ row }) => {
          const createdAt = new Date(row.original.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - createdAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let badgeColor = 'bg-green-100 text-green-800';
          if (diffDays > 7) badgeColor = 'bg-amber-100 text-amber-800';
          if (diffDays > 14) badgeColor = 'bg-red-100 text-red-800';
          
          return (
            <Badge className={badgeColor}>
              {diffDays} {diffDays === 1 ? 'Tag' : 'Tagen'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-green-500 text-green-700 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                setApprovalDialog({
                  open: true,
                  requisition: row.original,
                  action: 'approve'
                });
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Genehmigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-red-500 text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                setApprovalDialog({
                  open: true,
                  requisition: row.original,
                  action: 'reject'
                });
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Ablehnen
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Apply filters
  const filteredData = useMemo(() => {
    return pendingApprovals.filter(requisition => {
      const matchesSearch = searchQuery === '' || 
        requisition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requisition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        requisition.requesterName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || requisition.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pendingApprovals, searchQuery, statusFilter]);

  // Set up the table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setSelectedRequisitions,
  });

  const handleApprovalAction = () => {
    if (!approvalDialog.requisition || !approvalDialog.action) return;
    
    // Here you would call your API to approve/reject the requisition
    const action = approvalDialog.action;
    const requisitionId = approvalDialog.requisition.id;
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: action === 'approve' ? "Anforderung genehmigt" : "Anforderung abgelehnt",
        description: `Die Anforderung wurde erfolgreich ${action === 'approve' ? 'genehmigt' : 'abgelehnt'}.`,
      });
      
      setApprovalDialog({ open: false, requisition: null, action: null });
      setComment('');
    }, 500);
  };

  const handleBulkApprove = useCallback(async () => {
    if (selectedRequisitions.length === 0) return;
    
    setApprovalDialog({
      open: true,
      requisition: null,
      action: 'approve',
      bulk: true,
      count: selectedRequisitions.length
    });
  }, [selectedRequisitions]);

  // Group requisitions by urgency
  const urgentApprovals = filteredData.filter(req => req.priority === 'high');
  const normalApprovals = filteredData.filter(req => req.priority === 'normal');
  const lowApprovals = filteredData.filter(req => req.priority === 'low');
  
  // Calculate approval statistics
  const approvalStats = {
    total: pendingApprovals.length,
    manager: pendingApprovals.filter(req => req.status === 'manager_approval').length,
    finance: pendingApprovals.filter(req => req.status === 'finance_approval').length,
    submitted: pendingApprovals.filter(req => req.status === 'submitted').length,
    urgent: urgentApprovals.length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Freigaben</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Freigaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Manager-Freigaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalStats.manager}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Finanz-Freigaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalStats.finance}</div>
          </CardContent>
        </Card>
        <Card className={approvalStats.urgent > 0 ? "bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${approvalStats.urgent > 0 ? "text-red-800" : "text-muted-foreground"}`}>
              Dringende Freigaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${approvalStats.urgent > 0 ? "text-red-800" : ""}`}>
              {approvalStats.urgent}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Alle Freigaben ({filteredData.length})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="relative">
            Dringend ({urgentApprovals.length})
            {urgentApprovals.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="normal">
            Normal ({normalApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Niedrig ({lowApprovals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Suche nach Titel, Beschreibung oder Anforderer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setStatusFilter(value as RequisitionStatus | '')}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Status wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle</SelectItem>
                        <SelectItem value="submitted">Eingereicht</SelectItem>
                        <SelectItem value="manager_approval">Manager-Freigabe</SelectItem>
                        <SelectItem value="finance_approval">Finanz-Freigabe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setStatusFilter('');
                    }}
                  >
                    Filter zurücksetzen
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {sorting[0]?.desc ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                  Sortieren
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {[
                    { id: 'title', label: 'Titel' },
                    { id: 'requesterName', label: 'Anforderer' },
                    { id: 'priority', label: 'Priorität' },
                    { id: 'createdAt', label: 'Warte seit' },
                    { id: 'totalAmount', label: 'Gesamtbetrag' },
                  ].map((column) => (
                    <Button
                      key={column.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        const isCurrentlySorted = sorting[0]?.id === column.id;
                        setSorting([{
                          id: column.id,
                          desc: isCurrentlySorted ? !sorting[0].desc : false
                        }]);
                      }}
                    >
                      <span className="mr-2">{sorting[0]?.id === column.id && (
                        sorting[0]?.desc ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}</span>
                      {column.label}
                      {sorting[0]?.id === column.id && <Check className="w-4 h-4 ml-auto" />}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <ApprovalTable 
            table={table} 
            isLoading={isLoading} 
            navigate={navigate} 
            columns={columns}
          />
        </TabsContent>
        
        <TabsContent value="urgent">
          <ApprovalTable 
            table={useReactTable({
              data: urgentApprovals,
              columns,
              state: { sorting },
              onSortingChange: setSorting,
              getCoreRowModel: getCoreRowModel(),
              getSortedRowModel: getSortedRowModel(),
            })} 
            isLoading={isLoading} 
            navigate={navigate} 
            columns={columns}
            notice={{
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
              message: "Diese Anforderungen wurden als dringend markiert und benötigen zeitnahe Bearbeitung."
            }}
          />
        </TabsContent>
        
        <TabsContent value="normal">
          <ApprovalTable 
            table={useReactTable({
              data: normalApprovals,
              columns,
              state: { sorting },
              onSortingChange: setSorting,
              getCoreRowModel: getCoreRowModel(),
              getSortedRowModel: getSortedRowModel(),
            })} 
            isLoading={isLoading} 
            navigate={navigate} 
            columns={columns}
          />
        </TabsContent>
        
        <TabsContent value="low">
          <ApprovalTable 
            table={useReactTable({
              data: lowApprovals,
              columns,
              state: { sorting },
              onSortingChange: setSorting,
              getCoreRowModel: getCoreRowModel(),
              getSortedRowModel: getSortedRowModel(),
            })} 
            isLoading={isLoading} 
            navigate={navigate} 
            columns={columns}
            notice={{
              icon: <Clock className="h-5 w-5 text-blue-500" />,
              message: "Diese Anforderungen haben eine niedrige Priorität und können in Ihrer eigenen Geschwindigkeit bearbeitet werden."
            }}
          />
        </TabsContent>
      </Tabs>
      
      {selectedRequisitions.length > 0 && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white p-4 shadow-lg rounded-lg border">
          <span className="text-sm font-medium">{selectedRequisitions.length} ausgewählt</span>
          <Button
            size="sm"
            onClick={handleBulkApprove}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Alle genehmigen
          </Button>
        </div>
      )}

      <Dialog open={approvalDialog.open} onOpenChange={(open) => {
        if (!open) setApprovalDialog({ open: false, requisition: null, action: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.bulk 
                ? `${approvalDialog.count} Anforderungen genehmigen`
                : approvalDialog.action === 'approve' 
                  ? 'Anforderung genehmigen' 
                  : 'Anforderung ablehnen'
              }
            </DialogTitle>
            <DialogDescription>
              {approvalDialog.bulk
                ? 'Möchten Sie die ausgewählten Anforderungen genehmigen?'
                : approvalDialog.action === 'approve' 
                  ? 'Sind Sie sicher, dass Sie diese Anforderung genehmigen möchten?' 
                  : 'Bitte geben Sie einen Grund für die Ablehnung an.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {approvalDialog.requisition && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="font-semibold">{approvalDialog.requisition.title}</h3>
                <p className="text-sm text-gray-500">{approvalDialog.requisition.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Anforderer</p>
                  <p>{approvalDialog.requisition.requesterName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Abteilung</p>
                  <p>{approvalDialog.requisition.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Betrag</p>
                  <p>{approvalDialog.requisition.totalAmount.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priorität</p>
                  <p>{approvalDialog.requisition.priority}</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="comment">Kommentar</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Geben Sie einen Kommentar ein..."
              className="mt-2"
              rows={4}
              required={approvalDialog.action === 'reject'}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApprovalDialog({ open: false, requisition: null, action: null })}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleApprovalAction}
              disabled={approvalDialog.action === 'reject' && comment.trim() === ''}
              variant={approvalDialog.action === 'approve' ? "default" : "destructive"}
            >
              {approvalDialog.action === 'approve' ? 'Genehmigen' : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component to display approval tables
type ApprovalTableProps = {
  table: ReturnType<typeof useReactTable>,
  isLoading: boolean,
  navigate: ReturnType<typeof useNavigate>,
  columns: ColumnDef<Requisition>[],
  notice?: {
    icon: React.ReactNode,
    message: string
  }
}

function ApprovalTable({ table, isLoading, navigate, columns, notice }: ApprovalTableProps) {
  return (
    <div className="mt-4">
      {notice && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-gray-50 border rounded-md">
          {notice.icon}
          <p className="text-sm">{notice.message}</p>
        </div>
      )}
      
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
                  Keine Freigaben gefunden
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                  onClick={() => {
                    navigate({ 
                      to: '/procurement/requisitions/$requisitionId',
                      params: { requisitionId: row.original.id },
                      search: { requisitionId: row.original.id }
                    });
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === 'actions') {
                          e.stopPropagation();
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
      
      <div className="flex items-center justify-between mt-4">
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
    </div>
  );
}