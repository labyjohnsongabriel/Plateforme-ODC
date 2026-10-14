// src/components/ui/table.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ============================================================================
   TABLE — Conteneur racine
   ============================================================================ */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    /** Désactive le défilement horizontal */
    noScroll?: boolean;
  }
>(({ className, noScroll = false, ...props }, ref) => (
  <div
    className={cn(
      'relative w-full',
      !noScroll && 'overflow-x-auto scrollbar-thin',
    )}
  >
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

/* ============================================================================
   TABLE HEADER
   ============================================================================ */

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-odc-surface-alt/60 backdrop-blur-sm [&_tr]:border-b [&_tr]:border-odc-border',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

/* ============================================================================
   TABLE BODY
   ============================================================================ */

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

/* ============================================================================
   TABLE FOOTER
   ============================================================================ */

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-odc-border bg-odc-surface-alt/80 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

/* ============================================================================
   TABLE ROW
   ============================================================================ */

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    /** Désactive les effets de survol */
    noHover?: boolean;
  }
>(({ className, noHover = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-odc-border transition-colors',
      !noHover && 'hover:bg-odc-surface-alt/50',
      'data-[state=selected]:bg-odc-primary-soft/30',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

/* ============================================================================
   TABLE HEAD (cellule d'en-tête)
   ============================================================================ */

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      // Mise en page
      'h-11 px-4 text-left align-middle',
      // Typographie
      'text-xs font-semibold uppercase tracking-wider text-odc-muted',
      // Cas particulier : checkbox
      '[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-10',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

/* ============================================================================
   TABLE CELL (cellule de contenu)
   ============================================================================ */

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-odc-text-primary',
      '[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-10',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

/* ============================================================================
   TABLE CAPTION
   ============================================================================ */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-odc-muted', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

/* ============================================================================
   EXPORTS
   ============================================================================ */

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};