export enum InvoiceType {
  DUPLICATE = '二聯式',
  TRIPLICATE = '三聯式',
  UNKNOWN = '未知'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  type: InvoiceType;
  buyerName: string; // Title / Company Name
  buyerTaxId: string; // Unified Business No.
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  imageUrl?: string; // Base64
  createdAt: number;
}

// Helper to create empty invoice
export const createEmptyInvoice = (): InvoiceData => ({
  id: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  type: InvoiceType.TRIPLICATE,
  buyerName: '',
  buyerTaxId: '',
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  notes: '',
  createdAt: Date.now(),
});