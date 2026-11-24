import { useState } from 'react';
import type { PreviewDeploymentsResult } from '@vigilant-broccoli/github-workspace-js';
import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import {
  CHAT_STATUS,
  ChatPanel,
  type ChatPayload,
  PreviewDeployments,
  SecurityNewsList,
  WeatherEmbedCard,
} from '@vigilant-broccoli/react-lib-higher-level';
import type { SecurityNewsResponse } from '@vigilant-broccoli/security-news';

const HOUR_MS = 60 * 60 * 1000;

export const ChatPanelDemo = () => {
  const [messages, setMessages] = useState<ChatPayload[]>([
    { text: 'Welcome to the room.', sender: 'host', ts: Date.now() - HOUR_MS },
  ]);
  return (
    <div className="flex h-96 max-w-xl flex-col">
      <ChatPanel
        status={CHAT_STATUS.OPEN}
        messages={messages}
        sender="you"
        onSend={async payload => setMessages(prev => [...prev, payload])}
      />
    </div>
  );
};

const PREVIEW_RESULT: PreviewDeploymentsResult = {
  ok: true,
  openPullCount: 1,
  fetchedAt: new Date().toISOString(),
  pullRequests: [
    {
      number: 101,
      title: 'Add a sample feature',
      url: 'https://github.com/example/repo/pull/101',
      author: 'octocat',
      headRef: 'feat/sample-feature',
      apps: [
        {
          app: 'bookmarks-react',
          aliasUrl: 'https://example.com/preview',
          buildUrl: 'https://example.com/build',
          commit: 'abc1234',
          deployedAt: new Date().toISOString(),
        },
      ],
    },
  ],
};

export const PreviewDeploymentsDemo = () => (
  <PreviewDeployments loadPreviewDeployments={async () => PREVIEW_RESULT} />
);

const SECURITY_NEWS: SecurityNewsResponse = {
  items: [
    {
      title: 'Sample advisory for a popular package',
      source: 'Example Feed',
      reason: 'Matches a dependency in this repo',
      link: 'https://example.com/advisory',
      published: Date.now() - HOUR_MS,
    },
  ],
  failedFeeds: [],
  checkedFeeds: 3,
  fetchedAt: Date.now(),
};

export const SecurityNewsListDemo = () => (
  <SecurityNewsList data={SECURITY_NEWS} loading={false} error={null} />
);

export const WeatherEmbedCardDemo = () => (
  <div className="max-w-xl">
    <WeatherEmbedCard weatherUrl={VB_APP_URL.WEATHER.URL} />
  </div>
);
