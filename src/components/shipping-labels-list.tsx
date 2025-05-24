import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Package, Truck, Eye, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';

interface ShippingLabel {
  id: number;
  return_id: number;
  shipment_number: string;
  tracking_number?: string;
  label_filename?: string;
  shipper_name: string;
  consignee_name: string;
  service_type: string;
  weight: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ShippingLabelsListProps {
  returnId: number;
  onRefresh?: () => void;
}

const STATUS_COLORS = {
  created: 'secondary',
  shipped: 'default',
  in_transit: 'default',
  delivered: 'default',
  failed: 'destructive',
  cancelled: 'secondary'
} as const;

const SERVICE_TYPE_NAMES = {
  'V01PAK': 'DHL Paket',
  'V53WPAK': 'DHL Paket International',
  'V54EPAK': 'DHL Europaket',
  'V06PAK': 'DHL Paket Taggleich'
} as const;

export function ShippingLabelsList({ returnId, onRefresh }: ShippingLabelsListProps) {
  const { toast } = useToast();
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);

  const fetchLabels = async () => {
    try {
      const response = await fetch(`/api/shipping/labels/return/${returnId}`);
      const result = await response.json();

      if (response.ok) {
        setLabels(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch shipping labels');
      }
    } catch (error) {
      console.error('Error fetching shipping labels:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shipping labels',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [returnId]);

  const handleDownload = async (labelId: number, filename?: string) => {
    setDownloading(labelId);
    try {
      const response = await fetch(`/api/shipping/labels/${labelId}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download label');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `shipping_label_${labelId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Shipping label downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading label:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download label',
        variant: 'destructive'
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleTrackShipment = async (trackingNumber: string) => {
    setTracking(trackingNumber);
    try {
      const response = await fetch(`/api/shipping/track/${trackingNumber}`);
      const result = await response.json();

      if (response.ok) {
        // For now, just show a success message
        // In a real implementation, you'd show a tracking details dialog
        toast({
          title: 'Tracking Info',
          description: `Tracking data retrieved for ${trackingNumber}. Check console for details.`
        });
        console.log('Tracking data:', result.data);
      } else {
        throw new Error(result.error || 'Failed to track shipment');
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to track shipment',
        variant: 'destructive'
      });
    } finally {
      setTracking(null);
    }
  };

  const handleDeleteLabel = async (labelId: number) => {
    if (!confirm('Are you sure you want to delete this shipping label?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping/labels/${labelId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Shipping label deleted successfully'
        });
        fetchLabels();
        onRefresh?.();
      } else {
        throw new Error(result.error || 'Failed to delete label');
      }
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete label',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipping Labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading shipping labels...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Shipping Labels ({labels.length})
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            fetchLabels();
            onRefresh?.();
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {labels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shipping labels created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment Number</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="font-medium">
                      {label.shipment_number}
                    </TableCell>
                    <TableCell>
                      {label.tracking_number ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => handleTrackShipment(label.tracking_number!)}
                          disabled={tracking === label.tracking_number}
                        >
                          {tracking === label.tracking_number ? (
                            <span className="flex items-center gap-1">
                              <RotateCcw className="h-3 w-3 animate-spin" />
                              Tracking...
                            </span>
                          ) : (
                            label.tracking_number
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {SERVICE_TYPE_NAMES[label.service_type as keyof typeof SERVICE_TYPE_NAMES] || label.service_type}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {label.shipper_name}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {label.consignee_name}
                    </TableCell>
                    <TableCell>
                      {label.weight} kg
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[label.status as keyof typeof STATUS_COLORS] || 'secondary'}>
                        {label.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(label.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(label.id, label.label_filename)}
                          disabled={downloading === label.id}
                          title="Download PDF"
                        >
                          {downloading === label.id ? (
                            <RotateCcw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        {label.tracking_number && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTrackShipment(label.tracking_number!)}
                            disabled={tracking === label.tracking_number}
                            title="Track Shipment"
                          >
                            {tracking === label.tracking_number ? (
                              <RotateCcw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Truck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLabel(label.id)}
                          title="Delete Label"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}