import {
  ScrollTimeline,
  ScrollTimelineEntry,
  Text,
} from '@vigilant-broccoli/react-lib';

const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const BANK_TRANSACTIONS: ScrollTimelineEntry[] = [
  { id: 1, label: 'Paycheck deposit', sublabel: 'Jan 2', value: 4200 },
  { id: 2, label: 'Rent', sublabel: 'Jan 3', value: 2400 },
  { id: 3, label: 'Groceries', sublabel: 'Jan 6', value: 2210 },
  { id: 4, label: 'Coffee shop', sublabel: 'Jan 8', value: 2195 },
  { id: 5, label: 'Freelance invoice', sublabel: 'Jan 12', value: 3695 },
  { id: 6, label: 'Utilities', sublabel: 'Jan 15', value: 3510 },
  { id: 7, label: 'Restaurant', sublabel: 'Jan 18', value: 3455 },
  { id: 8, label: 'Paycheck deposit', sublabel: 'Jan 31', value: 7655 },
];

const COMMIT_TIMELINE: ScrollTimelineEntry[] = [
  { id: 'a1b2c3d', label: 'Initial commit', sublabel: 'a1b2c3d', value: 120 },
  {
    id: 'e4f5g6h',
    label: 'Add ScrollTimeline component',
    sublabel: 'e4f5g6h',
    value: 415,
  },
  {
    id: 'i7j8k9l',
    label: 'Wire up demo page',
    sublabel: 'i7j8k9l',
    value: 528,
  },
  {
    id: 'm1n2o3p',
    label: 'Refactor scroll tracking',
    sublabel: 'm1n2o3p',
    value: 486,
  },
  {
    id: 'q4r5s6t',
    label: 'Add unit tests',
    sublabel: 'q4r5s6t',
    value: 671,
  },
  {
    id: 'u7v8w9x',
    label: 'Fix animation easing',
    sublabel: 'u7v8w9x',
    value: 664,
  },
];

const formatBalance = (value: number) => CURRENCY_FORMATTER.format(value);
const formatLineCount = (value: number) => `${Math.round(value)} lines`;

export const ScrollTimelineDemo = () => (
  <div className="flex flex-col gap-8 sm:flex-row">
    <div className="flex-1">
      <Text size="2" weight="bold" mb="2">
        Bank balance
      </Text>
      <ScrollTimeline
        entries={BANK_TRANSACTIONS}
        valueLabel="Balance"
        formatValue={formatBalance}
      />
    </div>

    <div className="flex-1">
      <Text size="2" weight="bold" mb="2">
        Git commit history
      </Text>
      <ScrollTimeline
        entries={COMMIT_TIMELINE}
        valueLabel="Lines of code"
        formatValue={formatLineCount}
      />
    </div>
  </div>
);
