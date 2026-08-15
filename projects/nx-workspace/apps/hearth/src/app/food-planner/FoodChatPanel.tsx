'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn, Text } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { FoodChat } from './FoodChat';

const PANEL_BASE =
  'fixed inset-y-0 right-0 z-40 flex w-full flex-col sm:w-[28rem] max-w-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-xl p-6 transition-transform duration-300 ease-in-out';
const PANEL_OPEN = 'translate-x-0';
const PANEL_CLOSED = 'translate-x-full';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

export function FoodChatPanel({ open, onClose, onAdded }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div className={cn(PANEL_BASE, open ? PANEL_OPEN : PANEL_CLOSED)}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <Text size="5" weight="bold">
          {t('FOOD_PLANNER.COLUMNS.FOOD_CHAT')}
        </Text>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-sm p-1.5 opacity-70 transition-colors hover:bg-gray-100 hover:opacity-100 dark:hover:bg-gray-800"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <FoodChat onAdded={onAdded} />
      </div>
    </div>
  );
}
