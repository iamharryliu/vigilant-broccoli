import { Input, Text, Textarea } from '@vigilant-broccoli/react-lib';
import { useId } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const STATES = ['DEFAULT', 'DISABLED', 'ERROR', 'LONG_CONTENT'] as const;

const FIELD = {
  INPUT: { Control: Input, labelKey: 'FOUNDATION_DEMO.INPUT' },
  TEXTAREA: { Control: Textarea, labelKey: 'FOUNDATION_DEMO.TEXTAREA' },
} as const;

const FieldStatesDemo = ({ field }: { field: keyof typeof FIELD }) => {
  const { t } = useTranslation();
  const id = useId();
  const { Control, labelKey } = FIELD[field];
  return (
    <div className="flex flex-col gap-6">
      {STATES.map(state => {
        const invalid = state === 'ERROR';
        const controlId = `${id}-${state}`;
        const errorId = `${controlId}-error`;
        return (
          <DemoSection key={state} title={t(`FOUNDATION_DEMO.${state}`)}>
            <div className="min-w-0 max-w-md space-y-2">
              <Text as="label" htmlFor={controlId} size="2">
                {t(labelKey)}
              </Text>
              <Control
                id={controlId}
                disabled={state === 'DISABLED'}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                placeholder={t('FOUNDATION_DEMO.PLACEHOLDER')}
                defaultValue={
                  state === 'LONG_CONTENT'
                    ? t('FOUNDATION_DEMO.LONG_TEXT')
                    : undefined
                }
                className={invalid ? 'border-destructive' : undefined}
              />
            </div>
            {invalid && (
              <Text as="p" id={errorId} size="2" className="text-destructive">
                {t('FOUNDATION_DEMO.ERROR_MESSAGE')}
              </Text>
            )}
          </DemoSection>
        );
      })}
    </div>
  );
};

export const InputDemo = () => <FieldStatesDemo field="INPUT" />;

export const TextareaDemo = () => <FieldStatesDemo field="TEXTAREA" />;
