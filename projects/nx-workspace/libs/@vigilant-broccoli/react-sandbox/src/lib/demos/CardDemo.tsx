import {
  Button,
  Card,
  CardContainer,
  CardSkeleton,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

export const CardDemo = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('FOUNDATION_DEMO.PLAIN_CARD')}>
        <Card className="space-y-2 p-4">
          <Text as="p" size="3" weight="bold">
            {t('FOUNDATION_DEMO.CARD_TITLE')}
          </Text>
          <Text as="p" size="2" color="gray">
            {t('FOUNDATION_DEMO.CARD_BODY')}
          </Text>
        </Card>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.COMPOSED_CARD')}>
        <CardContainer
          title={t('FOUNDATION_DEMO.CARD_TITLE')}
          headerAction={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCount(value => value + 1)}
            >
              {t('FOUNDATION_DEMO.CARD_ACTION')}
            </Button>
          }
        >
          <Text as="p" size="2" role="status">
            {t('FOUNDATION_DEMO.CARD_COUNT', { count })}
          </Text>
        </CardContainer>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.LOADING')}>
        <div role="status" aria-label={t('FOUNDATION_DEMO.LOADING')}>
          <CardSkeleton showTitleSkeleton />
        </div>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.EMPTY')}>
        <Card className="p-6 text-center">
          <Text as="p" size="2" color="gray">
            {t('FOUNDATION_DEMO.EMPTY_MESSAGE')}
          </Text>
        </Card>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.LONG_CONTENT')}>
        <Card className="p-4">
          <Text as="p" size="2" className="break-words">
            {t('FOUNDATION_DEMO.LONG_TEXT')}
          </Text>
        </Card>
      </DemoSection>
    </div>
  );
};
