/**
 * Standard API Response Types
 */

export interface ApiResponse<T> {
  data: T;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ReturnStatus = string
export type FollowUpAction = 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss' | 'procurement' // Added procurement as a follow-up action
export type CreditNoteStatus = 'erstellt' | 'abgestimmt'
export type OrderStatus = 'bestellt' | 'geliefert' | 'teilgeliefert' | 'storniert'

// Field type for custom workflow fields
export type CustomFieldType = 'text' | 'number' | 'date' | 'money' | 'email' | 'phone' | 'select'

// Procurement types
export type RequisitionStatus = 
  | 'draft'
  | 'submitted' 
  | 'manager_approval' 
  | 'finance_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'converted'

export type ProcurementType =
  | 'material'
  | 'service'
  | 'asset'

export type WorkflowType = 
  | 'return'
  | 'procurement'  // Workflow types to differentiate between returns and procurement

export interface CustomField {
  id: string
  key: string       // Unique identifier like 'processor', 'trackingNumber'
  label: string     // Display name like 'Bearbeiter', 'Tracking-Nummer'
  description?: string
  type: CustomFieldType
  required: boolean
  defaultValue?: string | number | null
  options?: string[] // For select type fields
  entityType?: 'return' | 'requisition' | 'purchase_order' | 'supplier' // Added entity type for procurement
  isActive?: boolean      // Whether the field is currently active
  sortOrder?: number      // Display order for the field
  placeholder?: string    // Placeholder text for input fields
  createdAt?: string
  updatedAt?: string
}

// Procurement interfaces
export interface Requisition {
  id: string
  title: string
  description: string
  requesterId: string
  requesterName: string
  requesterEmail: string  // Added this field
  department: string
  priority: 'low' | 'normal' | 'high'
  status: RequisitionStatus
  createdAt: string
  updatedAt: string
  neededBy?: string
  budgetCode?: string
  totalAmount: number
  currency: string
  currentApprover?: string
  procurementType: ProcurementType
  customFields: Record<string, any>
  items: RequisitionItem[]
  comments: RequisitionComment[]
  attachmentIds: string[]
  notes?: string
  approverId?: string
  approverName?: string
}

export interface RequisitionItem {
  id: string
  requisitionId: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
  supplierId?: string
  supplierName?: string
  catalogItemId?: string
  sku?: string
  notes?: string
  estimatedDelivery?: string
}

export interface RequisitionComment {
  id: string
  requisitionId: string
  text: string
  createdAt: string
  userId: string
  userName: string
  type: 'comment' | 'approval' | 'rejection' | 'system'
  isInternal?: boolean // Whether the comment is internal/private
}

export interface PurchaseOrder {
  id: string
  requisitionId?: string
  orderNumber: string
  title: string
  description: string
  requesterId: string
  requesterName: string
  department: string
  priority: 'low' | 'normal' | 'high'
  status: 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  procurementType: ProcurementType
  customFields: Record<string, any>
  items: RequisitionItem[]
  supplierReference?: string
  paymentTerms?: string
  expectedDeliveryDate?: string
  billingAddress: Address
  shippingAddress: Address
  totalAmount: number
  currency: string
  attachmentIds: string[]
}

// Address interface for billing and shipping addresses
export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  addressLine2?: string
}

// Enhanced supplier interface - Modified for Synced Data
export interface Supplier {
  jtl_id: number;             // JTL Primary Key
  supplier_number?: string;    // From cLieferantennummer (UNIQUE)
  company_name?: string;       // From cFirma
  company_addition?: string;   // From cFirmaZusatz
  contact?: string;            // From cKontakt
  phone?: string;              // From cTelZentrale
  phone_direct?: string;       // From cTelDurchwahl
  fax?: string;                // From cFax
  email?: string;              // From cEMail
  city?: string;               // From cOrt
  country?: string;            // From cLand
  postal_code?: string;        // From cPlz
  street?: string;             // From cStrasse
  customer_number?: string;    // From cEigeneKundennummer (Our Nr at Supplier)
  notes?: string;              // From cAnmerkung
  last_synced: string;        // Sync timestamp
}

export interface ReturnProduct {
  id?: string
  productName: string
  quantity: number
  reason: string
  serialNumber?: string
}

export interface Note {
  id: string
  returnId: string
  content: string
  createdAt: string
  author: string
}

// Document types
export interface Document {
  id: string
  returnId: string
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  description?: string
  uploadDate: string
  thumbnailPath?: string
}

export interface DocumentUploadRequest {
  returnId: string
  description?: string
  file: File
}

export interface OrderProduct {
  id: number;                   // Local DB ID (if needed, might be jtl_id)
  jtl_id: number;               // JTL Order Position Primary Key
  jtl_article_id?: number;      // From kArtikel
  productName: string
  quantity: number
  price: number
  sku?: string
  serialNumber?: string // Add optional serial number field
}

export interface Order {
  jtl_id: number;               // JTL Order Primary Key
  localId?: number;             // Optional local DB ID if needed
  orderNumber: string
  supplierReference?: string     // From cFremdbelegnummer
  jtl_supplier_id?: number;      // From kLieferant
  orderDate: string
  deliveryDate?: string
  supplierName: string
  status: OrderStatus
  products: OrderProduct[]
  notes?: Note[]
  documents?: Document[]
  last_synced: string;         // Add sync timestamp
}

export interface ReturnItem {
  id: string
  products: ReturnProduct[]
  orderNumber?: string
  supplierReference?: string
  status: ReturnStatus
  followUpAction: FollowUpAction
  workflow_id?: string
  notes: Note[]
  documents?: Document[]
  orderId?: number
  
  // Dates
  commissioningDate?: string
  shippingDate?: string
  creditDate?: string
  reconciliationDate?: string
  
  // Credit Note Details
  creditNoteNumber?: string
  creditAmount?: number
  creditNoteStatus?: CreditNoteStatus
  originalInvoiceNumber?: string
  creditorNumber?: string
  reconciliationInvoiceNumber?: string
  
  // Custom fields - stored as key-value pairs
  customFields?: Record<string, any>,
  
  createdAt?: string,
  updatedAt?: string
}

// Settings types
export interface DatabaseSettings {
  host: string
  port: number
  database: string
  username: string
  password: string // Should be stored securely
  useSSL: boolean
  connectionTimeout: number
  isConnected: boolean
  lastConnectionTest: string // ISO date string
}

export interface StatusStep {
  id: string
  name: string
  description?: string
  color: string
  order: number
  requiredFields: string[] // Fields that must be filled to move to this status (can be system fields or custom field keys)
  workflowId: string
  createdAt?: string
  updatedAt?: string
}

export interface StatusWorkflow {
  id: string
  name: string
  followUpAction: FollowUpAction // Maps to which return type this applies to
  steps: StatusStep[]
  isDefault: boolean
  workflowType: WorkflowType  // Added to differentiate workflow types
  createdAt?: string
  updatedAt?: string
}

export interface ReturnReason {
  id: string
  code: string // Short code for the reason
  name: string
  description?: string
  categoryId: string
  isActive: boolean
  applicableActions: FollowUpAction[]
  createdAt?: string
  updatedAt?: string
}

export interface ReasonCategory {
  id: string
  name: string
  description?: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface ConvertToPOBody {
  supplierId: string;
  supplierName: string;
}

// Type for creating a return based on an order
export interface CreateReturnFromOrderData {
  orderId: number; // Original Order JTL ID
  products: { 
    jtl_id: number, // Original OrderProduct JTL ID
    quantity: number, 
    reason: string 
  }[];
  followUpAction: FollowUpAction;
  workflow_id?: string;
  status?: string;
}
