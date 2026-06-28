import { FindMeApp } from './components/FindMeApp';
import { I18nProvider } from './i18n';

export default function Page() {
  return (
    <I18nProvider>
      <FindMeApp />
    </I18nProvider>
  );
}
