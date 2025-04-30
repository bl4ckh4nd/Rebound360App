export type ReturnStatus = 'ausstehend' | 'beauftragt' | 'versandt' | 'gutgeschrieben' | 'abgeschlossen';
export type FollowUpAction = 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss';
export type CreditNoteStatus = 'erstellt' | 'abgestimmt';
export interface ReturnProduct {
    id?: string;
    productName: string;
    quantity: number;
    reason: string;
    serialNumber?: string;
}
export interface Note {
    id: string;
    returnId: string;
    content: string;
    createdAt: string;
    author: string;
}
export interface ReturnItem {
    id: string;
    products: ReturnProduct[];
    orderNumber?: string;
    supplierReference?: string;
    status: ReturnStatus;
    followUpAction: FollowUpAction;
    notes: Note[];
    commissioningDate?: string;
    shippingDate?: string;
    creditDate?: string;
    reconciliationDate?: string;
    creditNoteNumber?: string;
    creditAmount?: number;
    creditNoteStatus?: CreditNoteStatus;
    originalInvoiceNumber?: string;
    creditorNumber?: string;
    reconciliationInvoiceNumber?: string;
}
