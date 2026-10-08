import { DemoSection } from './DemoSection';
import { Button, Select } from '@vigilant-broccoli/react-lib';
import { ReactNode, useState } from 'react';
import { I18nProvider, useTranslation } from '../i18n';

interface Person {
  personId: number;
  name: string;
  role: string;
}

const NUMBER_OPTIONS = [0, 1, 2, 3, 4, 5];
const PERSON_OPTIONS: Person[] = [
  { personId: 0, name: 'Alice Johnson', role: 'Developer' },
  { personId: 1, name: 'Bob Smith', role: 'Designer' },
  { personId: 2, name: 'Charlie Brown', role: 'Manager' },
  { personId: 3, name: 'Diana Prince', role: 'Product Owner' },
];

const DemoRow = ({
  title,
  selected,
  children,
}: {
  title: string;
  selected?: string | number | Person;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <DemoSection title={title}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-wrap items-center gap-3">{children}</div>
        {selected !== undefined && (
          <div className="max-w-full text-xs text-muted-foreground">
            <div className="mb-1">{t('SELECT_DEMO.SELECTED')}</div>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DemoSection>
  );
};

const SelectDemoContent = () => {
  const { t } = useTranslation();
  const [selectedString, setSelectedString] = useState<string>();
  const [selectedNumber, setSelectedNumber] = useState<number | undefined>(0);
  const [selectedPerson, setSelectedPerson] = useState<Person>();
  const [selectedLongLabel, setSelectedLongLabel] = useState<string>();
  const [legacyNumber, setLegacyNumber] = useState<number | undefined>(0);
  const stringOptions = [
    t('SELECT_DEMO.FRUIT.APPLE'),
    t('SELECT_DEMO.FRUIT.BANANA'),
    t('SELECT_DEMO.FRUIT.ORANGE'),
    t('SELECT_DEMO.FRUIT.GRAPE'),
    t('SELECT_DEMO.FRUIT.MANGO'),
  ];
  const placeholder = t('SELECT_DEMO.PLACEHOLDER');

  return (
    <div className="flex flex-col gap-6">
      <DemoRow title={t('SELECT_DEMO.STRING')} selected={selectedString}>
        <Select
          aria-label={t('SELECT_DEMO.STRING')}
          value={selectedString}
          onValueChange={setSelectedString}
          options={stringOptions}
          placeholder={placeholder}
        />
      </DemoRow>
      <DemoRow title={t('SELECT_DEMO.NUMBER')} selected={selectedNumber}>
        <Select
          aria-label={t('SELECT_DEMO.NUMBER')}
          value={selectedNumber}
          onValueChange={setSelectedNumber}
          options={NUMBER_OPTIONS}
          placeholder={placeholder}
        />
        <Button variant="outline" onClick={() => setSelectedNumber(undefined)}>
          {t('SELECT_DEMO.CLEAR')}
        </Button>
      </DemoRow>
      <DemoRow title={t('SELECT_DEMO.OBJECT')} selected={selectedPerson}>
        <Select
          aria-label={t('SELECT_DEMO.OBJECT')}
          value={selectedPerson}
          onValueChange={setSelectedPerson}
          options={PERSON_OPTIONS}
          optionIdentifier="personId"
          optionDisplayKey="name"
          placeholder={placeholder}
        />
      </DemoRow>
      <DemoRow title={t('SELECT_DEMO.DISABLED')} selected={0}>
        <Select
          aria-label={t('SELECT_DEMO.DISABLED')}
          value={0}
          options={NUMBER_OPTIONS}
          disabled
        />
      </DemoRow>
      <DemoRow title={t('SELECT_DEMO.LONG_LABEL')} selected={selectedLongLabel}>
        <Select
          aria-label={t('SELECT_DEMO.LONG_LABEL')}
          value={selectedLongLabel}
          onValueChange={setSelectedLongLabel}
          options={[t('SELECT_DEMO.LONG_OPTION'), ...stringOptions]}
          placeholder={placeholder}
          className="w-64 max-w-full"
        />
      </DemoRow>
      <DemoRow title={t('SELECT_DEMO.LEGACY')} selected={legacyNumber}>
        <Select
          aria-label={t('SELECT_DEMO.LEGACY')}
          selectedOption={legacyNumber}
          setValue={setLegacyNumber}
          options={NUMBER_OPTIONS}
          optionIdenfifier="id"
          placeholder={placeholder}
        />
      </DemoRow>
    </div>
  );
};

export const SelectDemo = () => (
  <I18nProvider>
    <SelectDemoContent />
  </I18nProvider>
);
