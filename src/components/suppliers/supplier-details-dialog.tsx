import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Tag,
  Clock,
} from 'lucide-react';
import type { Supplier } from '@/shared/types';

interface SupplierDetailsDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierDetailsDialog({
  supplier,
  open,
  onClose,
}: SupplierDetailsDialogProps) {
  if (!supplier) return null;

  const displayValue = (value: string | number | undefined | null) => value || 'Nicht angegeben';

  const formatSyncDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('de-DE');
    } catch {
      return 'Ungültiges Datum';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {supplier.company_name || 'Unbekannter Lieferant'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
            <TabsTrigger value="additional">Zusatzinformationen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Lieferantennr.
                      </span>
                      <span className="font-medium">{displayValue(supplier.supplier_number)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ansprechpartner</span>
                      <span className="font-medium">{displayValue(supplier.contact)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Kundennr. (bei Lieferant)
                      </span>
                      <span className="font-medium">{displayValue(supplier.customer_number)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Synchronisiert
                      </span>
                      <span className="font-medium">{formatSyncDate(supplier.last_synced)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {supplier.notes && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notizen
                        </h3>
                        <p className="text-sm text-muted-foreground">{supplier.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-4">Kontaktinformationen</h3>
                  <div className="space-y-4">
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${supplier.email}`} className="text-sm hover:underline">
                          {supplier.email}
                        </a>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${supplier.phone}`} className="text-sm hover:underline">
                          {supplier.phone}
                        </a>
                      </div>
                    )}
                    {supplier.phone_direct && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {supplier.phone_direct} (Durchwahl)
                        </span>
                      </div>
                    )}
                    {supplier.fax && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {supplier.fax} (Fax)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-4">Adresse</h3>
                  {(supplier.street || supplier.city || supplier.postal_code || supplier.country) && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          {supplier.street && <div>{supplier.street}</div>}
                          {supplier.postal_code || supplier.city ? (
                            <div>{`${supplier.postal_code || ''} ${supplier.city || ''}`.trim()}</div>
                          ) : null}
                          {supplier.country && <div>{supplier.country}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  {!supplier.street && !supplier.city && !supplier.postal_code && !supplier.country && (
                    <p className="text-sm text-muted-foreground">Keine Adresse angegeben.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-4">Geschäftsinformationen</h3>
                  <p className="text-sm text-muted-foreground">
                    Keine zusätzlichen Geschäftsinformationen synchronisiert.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 