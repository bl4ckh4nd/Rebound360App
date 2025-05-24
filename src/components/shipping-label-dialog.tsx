import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Loader2, Package, User, MapPin } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ShippingLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnId: number;
  onSuccess?: () => void;
}

interface AddressForm {
  name1: string;
  name2?: string;
  streetName: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

interface ShipmentDetails {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  serviceType: string;
}

const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' }
];

const SERVICE_TYPES = [
  { code: 'V01PAK', name: 'DHL Paket' },
  { code: 'V53WPAK', name: 'DHL Paket International' },
  { code: 'V54EPAK', name: 'DHL Europaket' },
  { code: 'V06PAK', name: 'DHL Paket Taggleich' }
];

export function ShippingLabelDialog({ open, onOpenChange, returnId, onSuccess }: ShippingLabelDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [shipper, setShipper] = useState<AddressForm>({
    name1: '',
    streetName: '',
    houseNumber: '',
    city: '',
    postalCode: '',
    country: 'DE',
    phone: '',
    email: ''
  });

  const [consignee, setConsignee] = useState<AddressForm>({
    name1: '',
    streetName: '',
    houseNumber: '',
    city: '',
    postalCode: '',
    country: 'DE',
    phone: '',
    email: ''
  });

  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>({
    weight: 1,
    serviceType: 'V01PAK'
  });

  const updateShipper = (field: keyof AddressForm, value: string) => {
    setShipper(prev => ({ ...prev, [field]: value }));
  };

  const updateConsignee = (field: keyof AddressForm, value: string) => {
    setConsignee(prev => ({ ...prev, [field]: value }));
  };

  const updateShipmentDetails = (field: keyof ShipmentDetails, value: string | number) => {
    setShipmentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!shipper.name1 || !shipper.streetName || !shipper.houseNumber || !shipper.city || !shipper.postalCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required shipper fields',
        variant: 'destructive'
      });
      return;
    }

    if (!consignee.name1 || !consignee.streetName || !consignee.houseNumber || !consignee.city || !consignee.postalCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required consignee fields',
        variant: 'destructive'
      });
      return;
    }

    if (!shipmentDetails.weight || shipmentDetails.weight <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid weight',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shipping/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnId,
          shipper,
          consignee,
          ...shipmentDetails
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shipping label');
      }

      toast({
        title: 'Success',
        description: `Shipping label created: ${result.data.shipmentNumber}`
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating shipping label:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create shipping label',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Shipping Label
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipper Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Shipper Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipper-name1">Company Name *</Label>
                  <Input
                    id="shipper-name1"
                    value={shipper.name1}
                    onChange={(e) => updateShipper('name1', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="shipper-name2">Additional Name</Label>
                  <Input
                    id="shipper-name2"
                    value={shipper.name2 || ''}
                    onChange={(e) => updateShipper('name2', e.target.value)}
                    placeholder="Department, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="shipper-street">Street Name *</Label>
                  <Input
                    id="shipper-street"
                    value={shipper.streetName}
                    onChange={(e) => updateShipper('streetName', e.target.value)}
                    placeholder="Street name"
                  />
                </div>
                <div>
                  <Label htmlFor="shipper-house">House No. *</Label>
                  <Input
                    id="shipper-house"
                    value={shipper.houseNumber}
                    onChange={(e) => updateShipper('houseNumber', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipper-postal">Postal Code *</Label>
                  <Input
                    id="shipper-postal"
                    value={shipper.postalCode}
                    onChange={(e) => updateShipper('postalCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="shipper-city">City *</Label>
                  <Input
                    id="shipper-city"
                    value={shipper.city}
                    onChange={(e) => updateShipper('city', e.target.value)}
                    placeholder="City name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shipper-country">Country *</Label>
                <Select value={shipper.country} onValueChange={(value) => updateShipper('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipper-phone">Phone</Label>
                  <Input
                    id="shipper-phone"
                    value={shipper.phone || ''}
                    onChange={(e) => updateShipper('phone', e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <Label htmlFor="shipper-email">Email</Label>
                  <Input
                    id="shipper-email"
                    type="email"
                    value={shipper.email || ''}
                    onChange={(e) => updateShipper('email', e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consignee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4" />
                Consignee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consignee-name1">Name *</Label>
                  <Input
                    id="consignee-name1"
                    value={consignee.name1}
                    onChange={(e) => updateConsignee('name1', e.target.value)}
                    placeholder="Recipient name"
                  />
                </div>
                <div>
                  <Label htmlFor="consignee-name2">Additional Name</Label>
                  <Input
                    id="consignee-name2"
                    value={consignee.name2 || ''}
                    onChange={(e) => updateConsignee('name2', e.target.value)}
                    placeholder="c/o, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="consignee-street">Street Name *</Label>
                  <Input
                    id="consignee-street"
                    value={consignee.streetName}
                    onChange={(e) => updateConsignee('streetName', e.target.value)}
                    placeholder="Street name"
                  />
                </div>
                <div>
                  <Label htmlFor="consignee-house">House No. *</Label>
                  <Input
                    id="consignee-house"
                    value={consignee.houseNumber}
                    onChange={(e) => updateConsignee('houseNumber', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consignee-postal">Postal Code *</Label>
                  <Input
                    id="consignee-postal"
                    value={consignee.postalCode}
                    onChange={(e) => updateConsignee('postalCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="consignee-city">City *</Label>
                  <Input
                    id="consignee-city"
                    value={consignee.city}
                    onChange={(e) => updateConsignee('city', e.target.value)}
                    placeholder="City name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="consignee-country">Country *</Label>
                <Select value={consignee.country} onValueChange={(value) => updateConsignee('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consignee-phone">Phone</Label>
                  <Input
                    id="consignee-phone"
                    value={consignee.phone || ''}
                    onChange={(e) => updateConsignee('phone', e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <Label htmlFor="consignee-email">Email</Label>
                  <Input
                    id="consignee-email"
                    type="email"
                    value={consignee.email || ''}
                    onChange={(e) => updateConsignee('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-4 w-4" />
              Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="31.5"
                  value={shipmentDetails.weight}
                  onChange={(e) => updateShipmentDetails('weight', parseFloat(e.target.value) || 0)}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="1"
                  min="1"
                  value={shipmentDetails.length || ''}
                  onChange={(e) => updateShipmentDetails('length', parseFloat(e.target.value) || undefined)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="1"
                  min="1"
                  value={shipmentDetails.width || ''}
                  onChange={(e) => updateShipmentDetails('width', parseFloat(e.target.value) || undefined)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="1"
                  min="1"
                  value={shipmentDetails.height || ''}
                  onChange={(e) => updateShipmentDetails('height', parseFloat(e.target.value) || undefined)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="service-type">Service Type</Label>
                <Select value={shipmentDetails.serviceType} onValueChange={(value) => updateShipmentDetails('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(service => (
                      <SelectItem key={service.code} value={service.code}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Shipping Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}