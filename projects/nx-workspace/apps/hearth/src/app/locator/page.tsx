'use client';

import { Text } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { I18nProvider, useTranslation } from '../i18n';
import { LocatorApp } from './components/LocatorApp';

function LocatorContent() {
  const { t } = useTranslation();
  const session = useAuth();
  const { selectedHomeId } = useHome();

  if (selectedHomeId === null || !session?.user.id) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Text size="2" color="gray">
          {t('LOCATOR.NO_HOME')}
        </Text>
      </div>
    );
  }

  return (
    <LocatorApp
      homeId={selectedHomeId}
      userId={session.user.id}
      email={session.user.email ?? session.user.id}
    />
  );
}

export default function LocatorPage() {
  return (
    <I18nProvider>
      <LocatorContent />
    </I18nProvider>
  );
}
