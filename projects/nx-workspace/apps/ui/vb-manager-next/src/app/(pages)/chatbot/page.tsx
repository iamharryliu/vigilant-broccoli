'use client';

import { ChatbotPage } from '../../components/pages/ChatbotPage';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.CHATBOT.title);
  return (
    <div className="-m-4 h-[calc(100%+2rem)]">
      <ChatbotPage />
    </div>
  );
}
