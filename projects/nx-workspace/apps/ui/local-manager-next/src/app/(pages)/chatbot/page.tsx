'use client';

import { ChatbotPage } from '../../components/pages/ChatbotPage';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CHATBOT.title);
  return (
    <div className="-m-4 h-[calc(100%+2rem)]">
      <ChatbotPage />
    </div>
  );
}
