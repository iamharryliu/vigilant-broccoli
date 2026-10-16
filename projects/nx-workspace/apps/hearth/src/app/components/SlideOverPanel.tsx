'use client';

import { ReactNode, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@vigilant-broccoli/react-lib';

const PANEL_BASE =
  'fixed inset-y-0 right-0 z-40 w-full sm:w-[28rem] max-w-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-xl transition-transform duration-300 ease-in-out';
const PANEL_OPEN = 'translate-x-0';
const PANEL_CLOSED = 'translate-x-full';
const CLOSE_BUTTON_CLASS =
  'absolute left-0 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-100 hover:text-black dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export function SlideOverPanel({ open, onClose, className, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    document.documentElement.dataset.panelOpen = open ? 'true' : 'false';
    return () => {
      document.documentElement.dataset.panelOpen = 'false';
    };
  }, [open]);

  return (
    <div className={cn(PANEL_BASE, open ? PANEL_OPEN : PANEL_CLOSED)}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className={cn(CLOSE_BUTTON_CLASS, open ? 'flex' : 'hidden')}
      >
        <ChevronRight size={16} />
      </button>
      <div className={cn('h-full p-6', className)}>{children}</div>
    </div>
  );
}
