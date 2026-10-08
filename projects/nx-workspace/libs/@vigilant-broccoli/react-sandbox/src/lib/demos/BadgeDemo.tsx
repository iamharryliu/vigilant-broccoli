import { Badge } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const VARIANTS = ['soft', 'solid', 'outline', 'surface'] as const;
const COLORS = [
  'gray',
  'red',
  'blue',
  'green',
  'orange',
  'amber',
  'purple',
  'yellow',
] as const;
const COLOR_KEYS = {
  gray: 'GRAY',
  red: 'RED',
  blue: 'BLUE',
  green: 'GREEN',
  orange: 'ORANGE',
  amber: 'AMBER',
  purple: 'PURPLE',
  yellow: 'YELLOW',
} as const;
const VARIANT_KEYS = {
  soft: 'SOFT',
  solid: 'SOLID',
  outline: 'OUTLINE',
  surface: 'SURFACE',
} as const;

export const BadgeDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      {VARIANTS.map(variant => (
        <DemoSection
          key={variant}
          title={t(`FOUNDATION_DEMO.VARIANT.${VARIANT_KEYS[variant]}`)}
        >
          <div className="flex flex-wrap items-center gap-3">
            {COLORS.map(color => (
              <Badge key={color} color={color} variant={variant}>
                {t(`FOUNDATION_DEMO.COLOR.${COLOR_KEYS[color]}`)}
              </Badge>
            ))}
          </div>
        </DemoSection>
      ))}
      <DemoSection title={t('FOUNDATION_DEMO.SIZES')}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="1">{t('FOUNDATION_DEMO.SIZE_LABEL', { size: 1 })}</Badge>
          <Badge size="2">{t('FOUNDATION_DEMO.SIZE_LABEL', { size: 2 })}</Badge>
        </div>
      </DemoSection>
      <DemoSection title={t('FOUNDATION_DEMO.LONG_CONTENT')}>
        <Badge className="max-w-full whitespace-normal">
          {t('FOUNDATION_DEMO.LONG_BADGE')}
        </Badge>
      </DemoSection>
    </div>
  );
};
