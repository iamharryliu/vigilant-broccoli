import { CollapsibleCard, Text } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const Content = () => (
  <div className="flex flex-col gap-1">
    <Text as="p">
      The header is a tinted bar; the content below it has no background of its
      own.
    </Text>
    <Text as="p">Header and content share the same width and padding.</Text>
  </div>
);

export const CollapsibleCardDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.COLLAPSIBLE_CARD.DEFAULT')}>
        <CollapsibleCard title="More information">
          <Content />
        </CollapsibleCard>
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.COLLAPSIBLE_CARD.OPEN_BY_DEFAULT')}>
        <CollapsibleCard title="More information" defaultOpen>
          <Content />
        </CollapsibleCard>
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.COLLAPSIBLE_CARD.CHEVRON_RIGHT')}>
        <CollapsibleCard title="More information" chevronPosition="right">
          <Content />
        </CollapsibleCard>
      </DemoSection>
    </div>
  );
};
