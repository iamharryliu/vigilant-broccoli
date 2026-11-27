import { DangerCard } from '@vigilant-broccoli/react-lib';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

export const DangerCardDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.DANGER_CARD.WITH_DESCRIPTION')}>
        <DangerCard
          title="Delete all data"
          description="This removes every record and cannot be undone."
          actionLabel="Delete all"
          actionIcon={<Trash2 />}
          onAction={() => undefined}
        />
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.DANGER_CARD.DISABLED')}>
        <DangerCard
          title="Delete all data"
          description="There is nothing to delete."
          actionLabel="Delete all"
          actionIcon={<Trash2 />}
          actionDisabled
          onAction={() => undefined}
        />
      </DemoSection>
    </div>
  );
};
