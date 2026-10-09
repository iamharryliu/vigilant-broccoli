import { Checkbox, Text } from '@vigilant-broccoli/react-lib';
import { useId, useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const STATES = [
  'UNCHECKED',
  'CHECKED',
  'DISABLED',
  'DISABLED_CHECKED',
  'INDETERMINATE',
  'ERROR',
  'LONG_CONTENT',
] as const;

export const CheckboxDemo = () => {
  const { t } = useTranslation();
  const id = useId();
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('FOUNDATION_DEMO.CONTROLLED')}>
        <label
          className="flex items-start gap-2 text-sm"
          htmlFor={`${id}-controlled`}
        >
          <Checkbox
            id={`${id}-controlled`}
            checked={checked}
            onCheckedChange={value => setChecked(value === true)}
            className="mt-0.5"
          />
          {t('FOUNDATION_DEMO.CHECKBOX_LABEL')}
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
            className="flex items-start gap-2 text-sm"
            htmlFor={`${id}-${state}`}
          >
            <Checkbox
              id={`${id}-${state}`}
              defaultChecked={
                state === 'INDETERMINATE'
                  ? 'indeterminate'
                  : state === 'CHECKED' || state === 'DISABLED_CHECKED'
              }
              disabled={state === 'DISABLED' || state === 'DISABLED_CHECKED'}
              aria-invalid={state === 'ERROR' || undefined}
              aria-describedby={state === 'ERROR' ? `${id}-error` : undefined}
              className={
                state === 'ERROR'
                  ? 'mt-0.5 border-destructive focus-visible:ring-destructive'
                  : 'mt-0.5'
              }
            />
            {t(
              state === 'LONG_CONTENT'
                ? 'FOUNDATION_DEMO.LONG_CHECKBOX_LABEL'
                : 'FOUNDATION_DEMO.CHECKBOX_LABEL',
            )}
          </label>
          {state === 'ERROR' && (
            <Text
              as="p"
              id={`${id}-error`}
              size="2"
              className="text-destructive"
            >
              {t('FOUNDATION_DEMO.CHECKBOX_ERROR')}
            </Text>
          )}
        </DemoSection>
      ))}
    </div>
  );
};
