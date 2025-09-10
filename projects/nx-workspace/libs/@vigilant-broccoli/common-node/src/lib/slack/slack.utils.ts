import qs from 'querystring';
import { SlackMessage } from './slack.models';

export const createSlackHeaders = (
  token: string
): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

export const createSlackBlocks = (
  message: string
): Array<{ type: string; text: { type: string; text: string } }> => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: message,
    },
  },
];

export const stringifyQuery = (message: SlackMessage): string =>
  qs.stringify({
    channel: message.channelId,
    text: message.body,
    blocks: JSON.stringify(createSlackBlocks(message.body)),
    pretty: '1',
  });
