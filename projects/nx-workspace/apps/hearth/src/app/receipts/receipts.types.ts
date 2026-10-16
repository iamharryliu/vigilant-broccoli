import { DEFAULT_CURRENCY, today } from './receipt-utils';

export type DraftItem = {
  name: string;
  originalName: string;
  normalizedName: string | null;
  category: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
};

export type DraftTax = {
  rate: number;
  taxAmount: number | null;
  netAmount: number | null;
  grossAmount: number | null;
};

export type Draft = {
  merchantName: string;
  merchantAddress: string;
  purchasedAt: string;
  currency: string;
  taxInclusive: boolean;
  notes: string;
  items: DraftItem[];
  taxes: DraftTax[];
};

// A function rather than a const so the default purchase date is resolved when
// a scan starts, not when the module was first imported.
export const emptyDraft = (): Draft => ({
  merchantName: '',
  merchantAddress: '',
  purchasedAt: today(),
  currency: DEFAULT_CURRENCY,
  taxInclusive: true,
  notes: '',
  items: [],
  taxes: [],
});

export const emptyItem = (): DraftItem => ({
  name: '',
  originalName: '',
  normalizedName: null,
  category: null,
  unit: null,
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
});

export const emptyTax = (): DraftTax => ({
  rate: 0,
  taxAmount: 0,
  netAmount: null,
  grossAmount: null,
});
