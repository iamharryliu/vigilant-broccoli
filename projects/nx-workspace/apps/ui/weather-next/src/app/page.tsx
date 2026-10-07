import { WeatherApp } from './components/WeatherApp';
import { I18nProvider } from './i18n';

export default function Page() {
  return (
    <I18nProvider>
      <WeatherApp />
    </I18nProvider>
  );
}
