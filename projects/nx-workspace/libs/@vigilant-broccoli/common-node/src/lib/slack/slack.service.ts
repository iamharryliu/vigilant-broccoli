import { WebClient } from '@slack/web-api';
import { SLACK_API_URL } from './slack.consts';
import { SlackMessage } from './slack.models';
import { createSlackHeaders, stringifyQuery } from './slack.utils';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { HttpUtils } from '../http/http.utils';
import { Member } from '@slack/web-api/dist/types/response/UsersListResponse';
import { getEnvironmentVariable } from '../utils';

const sendSlackMessage = async (slackMessage: SlackMessage): Promise<void> => {
  const REQUEST_OPTIONS = {
    method: HTTP_METHOD.POST,
    headers: createSlackHeaders(slackMessage.token),
  };

  const query = stringifyQuery(slackMessage);
  await HttpUtils.makeHttpRequest(
    `${SLACK_API_URL}?${query}`,
    REQUEST_OPTIONS,
  );
};

const getSlackUsers = async (
  filter: (user: Member) => boolean,
): Promise<string[]> => {
  const client = new WebClient(getEnvironmentVariable('SLACK_BOT_TOKEN'));
  const result = await client.users.list({});

  return (
    result.members?.filter(filter).reduce((users: string[], member) => {
      if (member.id === 'USLACKBOT' || member.is_bot || member.deleted) {
        return users;
      }
      users.push(member.real_name || '');
      return users;
    }, []) || []
  );
};

export const SlackService = {
  sendSlackMessage,
  getSlackUsers,
};
