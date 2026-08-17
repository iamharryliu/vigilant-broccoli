'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { SlideOverPanel } from '../components/SlideOverPanel';
import { FoodChat } from './FoodChat';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

export function FoodChatPanel({ open, onClose, onAdded }: Props) {
  const { t } = useTranslation();

  return (
    <SlideOverPanel open={open} onClose={onClose} className="flex flex-col">
      <div className="mb-4 shrink-0">
        <Text size="5" weight="bold">
          {t('FOOD_PLANNER.COLUMNS.FOOD_CHAT')}
        </Text>
      </div>

      <div className="min-h-0 flex-1">
        <FoodChat onAdded={onAdded} />
      </div>
    </SlideOverPanel>
  );
}
