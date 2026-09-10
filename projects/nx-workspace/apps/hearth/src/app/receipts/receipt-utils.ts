import { Receipt, ReceiptItem, ReceiptTax } from '../../lib/types';

export const RECEIPTS_API = {
  BASE: '/api/receipts',
  ANALYZE: '/api/receipts/analyze',
  UPLOAD_URL: '/api/receipts/upload-url',
} as const;

export const DEFAULT_CURRENCY = 'CAD';

export const CURRENCIES = ['CAD', 'SEK', 'EUR', 'USD', 'GBP', 'DKK', 'NOK'];

export const formatPrice = (price: number, currency = DEFAULT_CURRENCY) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    price,
  );

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

export const formatRate = (rate: number) =>
  `${rate % 1 === 0 ? rate.toFixed(0) : rate.toFixed(2)}%`;

export const today = () => new Date().toISOString().split('T')[0];

export const round = (value: number) => Number(value.toFixed(2));

export const itemsSubtotal = (items: { totalPrice: number }[]) =>
  round(items.reduce((sum, item) => sum + item.totalPrice, 0));

export const taxesTotal = (taxes: { taxAmount: number | null }[]) =>
  round(taxes.reduce((sum, tax) => sum + (tax.taxAmount ?? 0), 0));

// With inclusive tax (European VAT) the line prices already contain the tax, so
// the lines sum to the amount paid. With exclusive tax (North American sales
// tax) the tax is added on top of the line sum.
export const computeTotals = (
  items: { totalPrice: number }[],
  taxes: { taxAmount: number | null }[],
  taxInclusive: boolean,
) => {
  const lineSum = itemsSubtotal(items);
  const tax = taxesTotal(taxes);
  return taxInclusive
    ? { net: round(lineSum - tax), tax, total: lineSum }
    : { net: lineSum, tax, total: round(lineSum + tax) };
};

export const receiptTotal = (receipt: Receipt) =>
  receipt.total ??
  computeTotals(receipt.items, receipt.taxes, receipt.taxInclusive).total;

export const itemCount = (items: ReceiptItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const parseNumber = (value: string): number | null => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

export const taxLabel = (tax: ReceiptTax, taxInclusive: boolean) =>
  `${formatRate(tax.rate)}${taxInclusive ? ' incl.' : ''}`;
