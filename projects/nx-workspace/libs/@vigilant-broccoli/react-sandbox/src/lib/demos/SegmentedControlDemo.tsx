import { SegmentedControl, Text } from '@vigilant-broccoli/react-lib';
import { Grid2X2, List, Rows3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const VIEW = { LIST: 'list', GRID: 'grid', TIMELINE: 'timeline' } as const;
type View = (typeof VIEW)[keyof typeof VIEW];
const VIEW_KEYS = { list: 'LIST', grid: 'GRID', timeline: 'TIMELINE' } as const;
const VIEW_ICONS = { list: List, grid: Grid2X2, timeline: Rows3 } as const;
const EXAMPLES = ['small', 'default', 'responsive'] as const;
const EXAMPLE_KEYS = {
  small: 'SEGMENTED_SMALL',
  default: 'SEGMENTED_DEFAULT',
  responsive: 'SEGMENTED_RESPONSIVE',
} as const;

export const SegmentedControlDemo = () => {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<(typeof EXAMPLES)[number], View>>(
    { small: VIEW.LIST, default: VIEW.LIST, responsive: VIEW.LIST },
  );
  return (
    <div className="flex flex-col gap-6">
      {EXAMPLES.map(example => {
        const title = t(`FOUNDATION_DEMO.${EXAMPLE_KEYS[example]}`);
        const options = Object.values(VIEW).map(value => {
          const Icon = VIEW_ICONS[value];
          return {
            value,
            label: t(`FOUNDATION_DEMO.VIEW.${VIEW_KEYS[value]}`),
            ...(example === 'responsive'
              ? {
                  icon: <Icon size={14} />,
                  shortLabel: t(
                    `FOUNDATION_DEMO.SHORT_VIEW.${VIEW_KEYS[value]}`,
                  ),
                }
              : {}),
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
                onChange={value =>
                  setValues(previous => ({ ...previous, [example]: value }))
                }
              />
            </div>
            <Text size="2" color="gray" role="status">
              {t('FOUNDATION_DEMO.SELECTED', {
                value: t(`FOUNDATION_DEMO.VIEW.${VIEW_KEYS[values[example]]}`),
              })}
            </Text>
          </DemoSection>
        );
      })}
    </div>
  );
};
