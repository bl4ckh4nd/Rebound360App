import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { PurchaseOrder } from '../shared/types';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

export function generatePurchaseOrderPDF(purchaseOrder: PurchaseOrder): Promise<Blob> {
  const documentDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Beschaffungsauftrag', style: 'header' },
      { text: purchaseOrder.orderNumber, style: 'subheader' },
      
      { text: '\n' }, // Spacer
      
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Rechnungsadresse:', style: 'label' },
              { text: purchaseOrder.billingAddress.street || '' },
              { text: purchaseOrder.billingAddress.addressLine2 || '' },
              { text: `${purchaseOrder.billingAddress.postalCode} ${purchaseOrder.billingAddress.city}` },
              { text: purchaseOrder.billingAddress.state || '' },
              { text: purchaseOrder.billingAddress.country }
            ].filter(item => item.text)
          },
          {
            width: '*',
            stack: [
              { text: 'Lieferadresse:', style: 'label' },
              { text: purchaseOrder.shippingAddress.street || '' },
              { text: purchaseOrder.shippingAddress.addressLine2 || '' },
              { text: `${purchaseOrder.shippingAddress.postalCode} ${purchaseOrder.shippingAddress.city}` },
              { text: purchaseOrder.shippingAddress.state || '' },
              { text: purchaseOrder.shippingAddress.country }
            ].filter(item => item.text)
          }
        ]
      },
      
      { text: '\n' }, // Spacer
      
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Beschreibung', style: 'tableHeader' },
              { text: 'Menge', style: 'tableHeader' },
              { text: 'Einheit', style: 'tableHeader' },
              { text: 'Einzelpreis', style: 'tableHeader' },
              { text: 'Gesamtpreis', style: 'tableHeader' }
            ],
            ...purchaseOrder.items.map(item => [
              item.description,
              item.quantity.toString(),
              item.unit,
              formatCurrency(item.unitPrice),
              formatCurrency(item.quantity * item.unitPrice)
            ])
          ]
        }
      },
      
      { text: '\n' }, // Spacer
      
      {
        alignment: 'right',
        stack: [
          { 
            text: `Gesamtbetrag: ${formatCurrency(purchaseOrder.totalAmount)}`,
            style: 'total'
          }
        ]
      },
      
      { text: '\n\n' }, // Spacer
      
      {
        stack: [
          { text: 'Bestellinformationen:', style: 'label' },
          `Besteller: ${purchaseOrder.requesterName}`,
          `Abteilung: ${purchaseOrder.department}`,
          `Priorität: ${purchaseOrder.priority}`,
          purchaseOrder.expectedDeliveryDate ? 
            `Gewünschter Liefertermin: ${new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()}` : '',
        ]
      }
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 5]
      },
      label: {
        fontSize: 12,
        bold: true,
        margin: [0, 5, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        fillColor: '#f3f4f6'
      },
      total: {
        fontSize: 14,
        bold: true
      }
    },
    defaultStyle: {
      fontSize: 11
    }
  };

  return new Promise((resolve) => {
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.getBlob((blob) => {
      resolve(blob);
    });
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}