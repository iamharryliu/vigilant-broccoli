'use client';

import { Card, Heading, Text } from '@radix-ui/themes';
import { Select } from '@vigilant-broccoli/react-lib';
import { LOCALES, useI18n, useTranslation } from '../../i18n';

const PAGE_CONTAINER = 'max-w-5xl mx-auto p-8 space-y-6';
const LANGUAGE_SELECT_CLASS = 'w-64';

type LanguageOption = { id: string; label: string };

export default function SettingsPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useI18n();

  const languageOptions: LanguageOption[] = [
    { id: LOCALES.EN, label: t('SETTINGS.LANGUAGE.OPTION.EN') },
    { id: LOCALES.SV, label: t('SETTINGS.LANGUAGE.OPTION.SV') },
  ];
  const selectedOption = languageOptions.find(option => option.id === locale);

  return (
    <div className={PAGE_CONTAINER}>
      <Heading>{t('SETTINGS.TITLE')}</Heading>
      <Card>
        <div className="space-y-4 p-4">
          <div>
            <Text weight="bold" size="3" as="p">
              {t('SETTINGS.LANGUAGE.TITLE')}
            </Text>
            <Text size="2" color="gray" as="p">
              {t('SETTINGS.LANGUAGE.DESCRIPTION')}
            </Text>
          </div>
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              {t('SETTINGS.LANGUAGE.LABEL')}
            </Text>
            <Select<LanguageOption>
              options={languageOptions}
              selectedOption={selectedOption}
              setValue={option => setLocale(option.id)}
              optionIdenfifier="id"
              optionDisplayKey="label"
              triggerClassName={LANGUAGE_SELECT_CLASS}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
