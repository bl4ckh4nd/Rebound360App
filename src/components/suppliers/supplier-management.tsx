import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { useSuppliers } from '../../renderer/hooks/useSuppliers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useNavigate } from '@tanstack/react-router';
import { SupplierDetailsDialog } from './supplier-details-dialog';
import type { Supplier } from '@/shared/types';

export function SupplierManagement() {
  const navigate = useNavigate();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data: suppliers = [], isLoading, error } = useSuppliers();

  const handleRowClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const columns = useMemo<ColumnDef<Supplier>[]>(() => [
    {
      id: 'company_name',
      header: 'Firma',
      accessorFn: (row) => row.company_name,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.company_name || 'N/A'}</div>
            {row.original.contact && (
              <div className="text-xs text-muted-foreground">
                {row.original.contact}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'supplier_number',
      header: 'Lieferantennr.',
      accessorKey: 'supplier_number',
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.supplier_number}
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Kontakt',
      accessorFn: (row) => `${row.email || ''} ${row.phone || ''} ${row.fax || ''}`,
      cell: ({ row }) => (
        <div>
          {row.original.email && (
            <div className="flex items-center text-xs">
              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[150px]" title={row.original.email}>{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center text-xs mt-1">
              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
              {row.original.phone}
            </div>
          )}
          {row.original.fax && (
            <div className="flex items-center text-xs mt-1">
              <FileText className="mr-2 h-3 w-3 text-muted-foreground" /> 
              {row.original.fax}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Standort',
      accessorFn: (row) => `${row.city || ''} ${row.country || ''}`,
      cell: ({ row }) => (
        <div>
          {(row.original.city || row.original.country) && (
            <div className="flex items-center text-xs">
              <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
              {row.original.city}
              {row.original.city && row.original.country ? ', ' : ''}
              {row.original.country}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'last_synced',
      header: 'Zuletzt synchronisiert',
      accessorFn: (row) => row.last_synced,
      cell: ({ row }) => {
        const date = new Date(row.original.last_synced);
        return (
          <Badge variant="outline" title={row.original.last_synced}>
            {isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('de-DE')}
          </Badge>
        );
      },
    },
  ], []);

  const filteredData = useMemo(() => {
    return suppliers.filter(supplier => {
      return searchQuery === '' || 
        (supplier.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (supplier.supplier_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contact || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [suppliers, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lieferantenverwaltung</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Suche nach Firma, Nr, Kontakt, E-Mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lieferanten</CardTitle>
          <CardDescription>
            {filteredData.length} Lieferanten gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort() ? "cursor-pointer select-none flex items-center" : ""
                            }
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
                      Keine Lieferanten gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Details Dialog */}
      <SupplierDetailsDialog
        supplier={selectedSupplier}
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
      />
    </div>
  );
}