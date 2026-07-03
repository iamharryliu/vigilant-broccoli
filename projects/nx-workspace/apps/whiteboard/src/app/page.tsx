import { WhiteboardApp } from './components/WhiteboardApp';
import { I18nProvider } from './i18n';

export default function Page() {
  return (
    <I18nProvider>
      <WhiteboardApp />
    </I18nProvider>
  );
}
