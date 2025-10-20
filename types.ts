export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  date: string; // ISO string format
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  lineItems: LineItem[];
  taxRate: number; // as a percentage, e.g., 21 for 21%
  notes: string;
  terms: string;
  logoUrl?: string;
}

export interface ClientAddress {
    id: string;
    name: string;
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface QuoteItemTemplate {
    id: string;
    description: string;
    unitPrice: number;
}