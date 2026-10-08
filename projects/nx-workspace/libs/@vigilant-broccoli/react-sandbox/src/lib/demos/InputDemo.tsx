import { Input, Text, Textarea } from '@vigilant-broccoli/react-lib';
import { useId } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const STATES = ['DEFAULT', 'DISABLED', 'ERROR', 'LONG_CONTENT'] as const;

export const InputDemo = () => {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div className="flex flex-col gap-6">
      {STATES.map(state => {
        const invalid = state === 'ERROR';
        const errorId = `${id}-${state}-error`;
        const value =
          state === 'LONG_CONTENT' ? t('FOUNDATION_DEMO.LONG_TEXT') : undefined;
        const sharedProps = {
          disabled: state === 'DISABLED',
          'aria-invalid': invalid || undefined,
          'aria-describedby': invalid ? errorId : undefined,
          placeholder: t('FOUNDATION_DEMO.PLACEHOLDER'),
          defaultValue: value,
          className: invalid
            ? 'border-destructive focus-visible:ring-destructive'
            : undefined,
        };
        return (
          <DemoSection key={state} title={t(`FOUNDATION_DEMO.${state}`)}>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Text as="label" htmlFor={`${id}-${state}-input`} size="2">
                  {t('FOUNDATION_DEMO.INPUT')}
                </Text>
                <Input id={`${id}-${state}-input`} {...sharedProps} />
              </div>
              <div className="min-w-0 space-y-2">
                <Text as="label" htmlFor={`${id}-${state}-textarea`} size="2">
                  {t('FOUNDATION_DEMO.TEXTAREA')}
                </Text>
                <Textarea id={`${id}-${state}-textarea`} {...sharedProps} />
              </div>
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
