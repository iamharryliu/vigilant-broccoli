import {
  BlockAction,
  SlackViewAction,
  ViewOutput,
  ViewStateSelectedOption,
} from '@slack/bolt';
import { loadAllPresences, savePresence, deletePresence } from './db.utils';
import { UserPresence } from '../types';
import { WebClient } from '@slack/web-api';
import { APP_COPY } from '../consts/app-copy.const';

export function handleCheckboxAction(body: BlockAction) {
  const action = body.actions[0];
  if (action.type !== 'checkboxes') return;
  const selectedDates = action.selected_options.map(opt => opt.value as string);

  const userPresences = loadAllPresences();

  if (!userPresences[body.user.id]) {
    userPresences[body.user.id] = {};
  }

  for (const date of selectedDates) {
    savePresence(
      body.user.id,
      date,
      userPresences[body.user.id][date] ||
        ({
          isWholeDay: true,
        } as UserPresence),
    );
  }
  for (const date of Object.keys(userPresences[body.user.id])) {
    if (!selectedDates.includes(date)) {
      delete userPresences[body.user.id][date];
      deletePresence(body.user.id, date);
    }
  }
}

export function handleScheduleModalSubmit(
  body: SlackViewAction,
  view: ViewOutput,
) {
  const userId = body.user.id;
  const dateOptions = view.state.values.date_block.date.selected_options || [];
  const selectedDates = dateOptions.map(opt => opt.value);

  const office = view.state.values.office_block?.office.selected_option?.value;
  const presenceTime =
    view.state.values.presence_block.presence.selected_option?.value;
  const isBringingDog =
    (
      view.state.values.dog_block.dog
        .selected_options as ViewStateSelectedOption[]
    ).length > 0;
  const message = view.state.values.message_block.message.value || '';

  const userPresence: UserPresence = {
    office,
    isBringingDog,
    presenceTime,
    message,
  };

  // Save for each selected date
  selectedDates.forEach(date => {
    savePresence(userId, date, userPresence);
  });
}

export function handleUpdateSettings(
  _body: SlackViewAction,
  _view: ViewOutput,
) {
  // eslint-disable-next-line no-console
  console.log('Update Settings');
}

export async function handleAskLunchAction(
  userId: string,
  selectedUserIds: string[],
  client: WebClient,
) {
  if (selectedUserIds.length === 0) {
    await client.chat.postEphemeral({
      channel: userId,
      user: userId,
      text: APP_COPY.ACTIONS.NO_USERS_SELECTED,
    });
    return;
  }
  const allUserIds = [userId, ...selectedUserIds];
  const conv = await client.conversations.open({
    users: allUserIds.join(','),
  });
  await client.chat.postMessage({
    channel: conv.channel?.id as string,
    text: APP_COPY.ACTIONS.askingAboutLunch(userId),
  });
  await client.chat.postEphemeral({
    channel: userId,
    user: userId,
    text: APP_COPY.ACTIONS.createdGroupChat(selectedUserIds.length),
  });
}
