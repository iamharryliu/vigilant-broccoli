import { Switch, Text } from '@vigilant-broccoli/react-lib';
import { useId, useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const STATES = ['DEFAULT', 'CHECKED', 'DISABLED', 'DISABLED_CHECKED'] as const;

export const SwitchDemo = () => {
  const { t } = useTranslation();
  const id = useId();
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('FOUNDATION_DEMO.CONTROLLED')}>
        <label
          htmlFor={`${id}-controlled`}
          className="flex items-center gap-2 text-sm"
        >
          <Switch
            id={`${id}-controlled`}
            checked={checked}
            onCheckedChange={setChecked}
          />
          {t('DEMO_SECTION.SWITCH.LABEL')}
        </label>
        <Text size="2" color="gray" role="status">
          {t('FOUNDATION_DEMO.SELECTED', {
            value: t(
              checked ? 'FOUNDATION_DEMO.CHECKED' : 'FOUNDATION_DEMO.UNCHECKED',
            ),
          })}
        </Text>
      </DemoSection>
      {STATES.map(state => (
        <DemoSection key={state} title={t(`FOUNDATION_DEMO.${state}`)}>
          <label
            htmlFor={`${id}-${state}`}
            className="flex items-center gap-2 text-sm"
          >
            <Switch
              id={`${id}-${state}`}
              defaultChecked={
                state === 'CHECKED' || state === 'DISABLED_CHECKED'
              }
              disabled={state === 'DISABLED' || state === 'DISABLED_CHECKED'}
            />
            {t('DEMO_SECTION.SWITCH.LABEL')}
          </label>
        </DemoSection>
      ))}
    </div>
  );
};
