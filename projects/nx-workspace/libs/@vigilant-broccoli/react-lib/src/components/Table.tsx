import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '../utils/cn';

const SIZE_CLASS = {
  '1': 'text-xs [--table-cell-padding:0.5rem]',
  '2': 'text-sm [--table-cell-padding:0.75rem]',
  '3': 'text-base [--table-cell-padding:1rem]',
} as const;
const CELL_CLASS = 'p-[var(--table-cell-padding)] text-left align-top';

export type TableRootProps = ComponentPropsWithoutRef<'table'> & {
  size?: keyof typeof SIZE_CLASS;
  variant?: 'ghost' | 'surface';
};

const Root = forwardRef<HTMLTableElement, TableRootProps>(
  ({ size = '2', variant = 'ghost', className, ...props }, ref) => (
    <div
      className={cn(
        'overflow-x-auto',
        variant === 'surface' &&
          'rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
      )}
    >
      <table
        ref={ref}
        className={cn('w-full border-collapse', SIZE_CLASS[size], className)}
        {...props}
      />
    </div>
  ),
);
Root.displayName = 'Table.Root';

const Header = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<'thead'>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-gray-50 dark:bg-gray-800', className)}
    {...props}
  />
));
Header.displayName = 'Table.Header';

const Body = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<'tbody'>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&>tr:last-child]:border-b-0', className)}
    {...props}
  />
));
Body.displayName = 'Table.Body';

const Row = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    />
  ),
);
Row.displayName = 'Table.Row';

const Cell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'td'>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn(CELL_CLASS, className)} {...props} />
  ),
);
Cell.displayName = 'Table.Cell';

const ColumnHeaderCell = forwardRef<
  HTMLTableCellElement,
  ComponentPropsWithoutRef<'th'>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(CELL_CLASS, 'font-medium', className)}
    {...props}
  />
));
ColumnHeaderCell.displayName = 'Table.ColumnHeaderCell';

const RowHeaderCell = forwardRef<
  HTMLTableCellElement,
  ComponentPropsWithoutRef<'th'>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="row"
    className={cn(CELL_CLASS, 'font-medium', className)}
    {...props}
  />
));
RowHeaderCell.displayName = 'Table.RowHeaderCell';

export const Table = {
  Root,
  Header,
  Body,
  Row,
  Cell,
  ColumnHeaderCell,
  RowHeaderCell,
};
