import { SegmentedControl, Text } from '@vigilant-broccoli/react-lib';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const THEME = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' } as const;
type Theme = (typeof THEME)[keyof typeof THEME];
const THEME_KEYS = { light: 'LIGHT', dark: 'DARK', system: 'SYSTEM' } as const;
const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;
const EXAMPLES = ['small', 'default', 'responsive', 'fullWidth'] as const;
const EXAMPLE_KEYS = {
  small: 'SEGMENTED_SMALL',
  default: 'SEGMENTED_DEFAULT',
  responsive: 'SEGMENTED_RESPONSIVE',
  fullWidth: 'SEGMENTED_FULL_WIDTH',
} as const;

export const SegmentedControlDemo = () => {
  const { t } = useTranslation();
  const [values, setValues] = useState<
    Record<(typeof EXAMPLES)[number], Theme>
  >({
    small: THEME.SYSTEM,
    default: THEME.SYSTEM,
    responsive: THEME.SYSTEM,
    fullWidth: THEME.SYSTEM,
  });
  return (
    <div className="flex flex-col gap-6">
      {EXAMPLES.map(example => {
        const title = t(`FOUNDATION_DEMO.${EXAMPLE_KEYS[example]}`);
        const options = Object.values(THEME).map(value => {
          const Icon = THEME_ICONS[value];
          return {
            value,
            label: t(`FOUNDATION_DEMO.THEME.${THEME_KEYS[value]}`),
            ...(example === 'responsive'
              ? {
                  icon: <Icon size={14} />,
                  shortLabel: t(
                    `FOUNDATION_DEMO.SHORT_THEME.${THEME_KEYS[value]}`,
                  ),
                }
              : {}),
            ...(example === 'fullWidth' ? { icon: <Icon size={14} /> } : {}),
          };
        });
        return (
          <DemoSection key={example} title={title}>
            <div className="max-w-full overflow-x-auto">
              <SegmentedControl
                label={title}
                value={values[example]}
                options={options}
                size={example === 'small' ? 'sm' : 'md'}
                fullWidth={example === 'fullWidth'}
                onChange={value =>
                  setValues(previous => ({ ...previous, [example]: value }))
                }
              />
            </div>
            <Text size="2" color="gray" role="status">
              {t('FOUNDATION_DEMO.SELECTED', {
                value: t(
                  `FOUNDATION_DEMO.THEME.${THEME_KEYS[values[example]]}`,
                ),
              })}
            </Text>
          </DemoSection>
        );
      })}
    </div>
  );
};
