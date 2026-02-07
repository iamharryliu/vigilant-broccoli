import * as qs from 'querystring';
import { WebClient } from '@slack/web-api';
import { Member } from '@slack/web-api/dist/types/response/UsersListResponse';
import { SlackMessage } from './slack.models';
import { SLACK_FIELD_LABEL } from './slack.consts';

export const createSlackHeaders = (
  token: string,
): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

export const createSlackBlocks = (
  message: string,
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

export async function getAllUsers(client: WebClient) {
  let allUsers: Member[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await client.users.list({ cursor });

    allUsers = allUsers.concat((response.members || []) as Member[]);
    cursor = response.response_metadata?.next_cursor || undefined;
  } while (cursor);

  return allUsers;
}

export async function getFieldId(
  client: WebClient,
  fieldLabel: string,
): Promise<string | null> {
  const response = await client.team.profile.get();

  if (!response.profile?.fields) {
    return null;
  }

  const field = response.profile.fields.find(
    field => field.label === fieldLabel,
  );

  return field?.id || null;
}

export async function updateUserBirthday({
  client,
  slackUser,
  birthday,
  fieldLabel = SLACK_FIELD_LABEL.BIRTHDAY,
}: {
  client: WebClient;
  slackUser: Member;
  birthday: string;
  fieldLabel?: string;
}): Promise<void> {
  const birthdayFieldId = await getFieldId(client, fieldLabel);

  if (!birthdayFieldId) {
    throw new Error(`${fieldLabel} field not found in team profile.`);
  }

  const userId = slackUser.id;
  const realName = slackUser.profile?.real_name;

  try {
    await client.users.profile.set({
      user: userId,
      profile: {
        fields: {
          [birthdayFieldId]: {
            value: birthday,
            alt: birthday,
          },
        },
      },
    });

    console.log(`Updated birthday for ${realName} (${userId}): ${birthday}`);
  } catch (error) {
    console.log(`Unable to update Slack user ${realName}`);
    console.log(error);
  }
}
