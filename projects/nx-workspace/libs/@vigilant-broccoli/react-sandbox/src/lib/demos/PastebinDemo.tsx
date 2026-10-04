import type { PastebinGroup } from '@vigilant-broccoli/common-js';
import { Pastebin, Text } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './pastebin/i18n';

const SAMPLE_VALUE = {
  EMAIL: 'demo@example.com',
  PHONE: '+1 202-555-0100',
  WEBSITE: 'https://example.com',
  DOCUMENTATION: 'https://example.org/docs',
  COMMAND: 'pnpm nx serve component-library',
  ADDRESS: '123 Example Street, Sample City',
} as const;

const PastebinDemoContent = () => {
  const { t } = useTranslation();
  const groups: PastebinGroup[] = [
    {
      name: t('PASTEBIN.CONTACT'),
      entries: [
        { label: t('PASTEBIN.EMAIL'), value: SAMPLE_VALUE.EMAIL },
        { label: t('PASTEBIN.PHONE'), value: SAMPLE_VALUE.PHONE },
        { label: t('PASTEBIN.ADDRESS'), value: SAMPLE_VALUE.ADDRESS },
      ],
    },
    {
      name: t('PASTEBIN.LINKS'),
      entries: [
        { label: t('PASTEBIN.WEBSITE'), value: SAMPLE_VALUE.WEBSITE },
        {
          label: t('PASTEBIN.DOCUMENTATION'),
          value: SAMPLE_VALUE.DOCUMENTATION,
        },
      ],
    },
    {
      name: t('PASTEBIN.SNIPPETS'),
      entries: [
        {
          label: t('PASTEBIN.GREETING'),
          value: t('PASTEBIN.GREETING_VALUE'),
        },
        { label: t('PASTEBIN.COMMAND'), value: SAMPLE_VALUE.COMMAND },
      ],
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <Text size="2" color="gray">
        {t('PASTEBIN.HINT')}
      </Text>
      <Pastebin
        groups={groups}
        searchPlaceholder={t('PASTEBIN.SEARCH_PLACEHOLDER')}
      />
    </div>
  );
};

export const PastebinDemo = () => (
  <I18nProvider>
    <PastebinDemoContent />
  </I18nProvider>
);
