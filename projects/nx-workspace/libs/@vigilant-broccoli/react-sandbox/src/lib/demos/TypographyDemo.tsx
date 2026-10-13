import { Heading, Text } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const SIZES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const WEIGHTS = ['light', 'regular', 'medium', 'bold'] as const;
const WEIGHT_KEYS = {
  light: 'LIGHT',
  regular: 'REGULAR',
  medium: 'MEDIUM',
  bold: 'BOLD',
} as const;
const COLORS = ['gray', 'red', 'blue', 'green', 'orange'] as const;
const COLOR_KEYS = {
  gray: 'GRAY',
  red: 'RED',
  blue: 'BLUE',
  green: 'GREEN',
  orange: 'ORANGE',
} as const;

export const TypographyDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('FOUNDATION_DEMO.TEXT_SCALE')}>
        {SIZES.map(size => (
          <div key={size} className="min-w-0 space-y-1">
            <Text as="p" size="1" color="gray">
              {t('FOUNDATION_DEMO.SIZE_LABEL', { size })}
            </Text>
            <Text as="p" size={size} className="break-words">
              {t('FOUNDATION_DEMO.TEXT_SAMPLE')}
            </Text>
          </div>
        ))}
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.HEADING_SCALE')}>
        {SIZES.map(size => (
          <div key={size} className="min-w-0 space-y-1">
            <Text as="p" size="1" color="gray">
              {t('FOUNDATION_DEMO.SIZE_LABEL', { size })}
            </Text>
            <Heading as="h3" size={size} className="break-words">
              {t('FOUNDATION_DEMO.HEADING_SAMPLE')}
            </Heading>
          </div>
        ))}
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.WEIGHTS')}>
        {WEIGHTS.map(weight => (
          <Text as="p" key={weight} weight={weight} size="3">
            {t(`FOUNDATION_DEMO.WEIGHT.${WEIGHT_KEYS[weight]}`)}
          </Text>
        ))}
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.COLORS')}>
        <div className="flex flex-wrap gap-4">
          {COLORS.map(color => (
            <Text key={color} color={color} size="3">
              {t(`FOUNDATION_DEMO.COLOR.${COLOR_KEYS[color]}`)}
            </Text>
          ))}
        </div>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.LONG_CONTENT')}>
        <Text as="p" size="3" className="max-w-sm break-words">
          {t('FOUNDATION_DEMO.LONG_TEXT')}
        </Text>
      </DemoSection>
    </div>
  );
};
