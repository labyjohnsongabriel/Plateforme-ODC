// src/components/ui/table.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE — Conteneur racine
   ═══════════════════════════════════════════════════════════════════════════ */

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Désactive le défilement horizontal */
  noScroll?: boolean;
  /** Active l'alternance de lignes (zebra) */
  striped?: boolean;
  /** Fixe l'en-tête au scroll */
  stickyHeader?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, noScroll = false, striped = false, stickyHeader = false, ...props }, ref) => (
    <div
      className={cn(
        'relative w-full',
        !noScroll && 'overflow-x-auto scrollbar-thin',
        stickyHeader && 'max-h-[70vh] overflow-y-auto',
      )}
    >
      <table
        ref={ref}
        data-striped={striped || undefined}
        className={cn(
          'w-full caption-bottom text-sm',
          striped && '[&_tbody_tr:nth-child(even)]:bg-odc-surface-alt/30',
          stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE HEADER
   ═══════════════════════════════════════════════════════════════════════════ */

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-odc-surface-alt/80 backdrop-blur-sm',
      '[&_tr]:border-b [&_tr]:border-odc-border',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE BODY
   ═══════════════════════════════════════════════════════════════════════════ */

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t-2 border-odc-border bg-odc-surface-alt font-semibold',
      '[&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE ROW
   ═══════════════════════════════════════════════════════════════════════════ */

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Désactive les effets de survol */
  noHover?: boolean;
  /** Marque la ligne comme sélectionnée */
  selected?: boolean;
  /** Marque la ligne comme cliquable */
  interactive?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, noHover = false, selected = false, interactive = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? 'selected' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'border-b border-odc-border/60 transition-colors',
        !noHover && 'hover:bg-odc-surface-alt/60',
        interactive && 'cursor-pointer focus-visible:outline-none focus-visible:bg-odc-primary-soft/20',
        'data-[state=selected]:bg-odc-primary-soft/40',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE HEAD (cellule d'en-tête)
   ═══════════════════════════════════════════════════════════════════════════ */

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      'h-12 px-4 text-left align-middle',
      'text-xs font-semibold uppercase tracking-wider text-odc-text-muted',
      '[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-10',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE CELL (cellule de contenu)
   ═══════════════════════════════════════════════════════════════════════════ */

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3 align-middle text-odc-text-primary',
      '[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-10',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE CAPTION
   ═══════════════════════════════════════════════════════════════════════════ */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-odc-text-muted', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE EMPTY (état vide réutilisable)
   ═══════════════════════════════════════════════════════════════════════════ */

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
}

const TableEmpty = ({ colSpan, message = 'Aucune donnée', icon }: TableEmptyProps) => (
  <tr>
    <td colSpan={colSpan} className="h-32 text-center">
      <div className="flex flex-col items-center justify-center gap-2 text-odc-text-muted">
        {icon && <div className="opacity-60">{icon}</div>}
        <p className="text-sm">{message}</p>
      </div>
    </td>
  </tr>
);
TableEmpty.displayName = 'TableEmpty';

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
};