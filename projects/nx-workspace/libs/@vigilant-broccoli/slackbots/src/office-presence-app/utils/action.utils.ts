import {
  BlockAction,
  SlackViewAction,
  ViewOutput,
  ViewStateSelectedOption,
} from '@slack/bolt';
import {
  loadAllPresences,
  savePresence,
  deletePresence,
  saveEvent,
  loadEventById,
  loadUserSettings,
  updateEventAttendees,
  deleteEvent,
  updateEvent,
  saveUserSettings,
} from './db.utils';
import { UserPresence, OfficeEvent, UserSettings } from '../types';
import { WebClient } from '@slack/web-api';
import { AppCopy } from '../consts/app-copy.const';
import { ACTION_ID, BLOCK_ID } from '../consts/data.consts';
import { validateInput } from './input-validation.utils';

export function handleCheckboxAction(body: BlockAction) {
  const action = body.actions[0];
  if (action.type !== 'checkboxes') return;
  const selectedDates = action.selected_options.map(opt => opt.value as string);

  const userPresences = loadAllPresences();

  if (!userPresences[body.user.id]) {
    userPresences[body.user.id] = {};
  }

  const { defaultOffice } = loadUserSettings(body.user.id);

  for (const date of selectedDates) {
    savePresence(
      body.user.id,
      date,
      userPresences[body.user.id][date] ||
        ({ office: defaultOffice } as UserPresence),
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
  const dateOptions =
    view.state.values[BLOCK_ID.DATE][ACTION_ID.DATE].selected_options || [];
  const selectedDates = dateOptions.map(opt => opt.value);

  const office =
    view.state.values[BLOCK_ID.OFFICE]?.[ACTION_ID.OFFICE].selected_option
      ?.value;
  const presenceTime =
    view.state.values[BLOCK_ID.PRESENCE][ACTION_ID.PRESENCE].selected_option
      ?.value;
  const isBringingDog =
    (
      view.state.values[BLOCK_ID.DOG][ACTION_ID.DOG]
        .selected_options as ViewStateSelectedOption[]
    ).length > 0;
  const message = validateInput(
    view.state.values[BLOCK_ID.MESSAGE][ACTION_ID.MESSAGE].value || '',
  );

  const userPresence: UserPresence = {
    office,
    isBringingDog,
    presenceTime,
    message,
  };

  selectedDates.forEach(date => {
    savePresence(userId, date, userPresence);
  });
}

export async function handleAskLunchAction(
  userId: string,
  selectedUserIds: string[],
  client: WebClient,
  copy: AppCopy,
) {
  if (selectedUserIds.length === 0) {
    await client.chat.postEphemeral({
      channel: userId,
      user: userId,
      text: copy.ACTIONS.NO_USERS_SELECTED,
    });
    return;
  }
  const allUserIds = [userId, ...selectedUserIds];
  const conv = await client.conversations.open({
    users: allUserIds.join(','),
  });
  await client.chat.postMessage({
    channel: conv.channel?.id as string,
    text: copy.ACTIONS.askingAboutLunch(userId),
  });
  await client.chat.postEphemeral({
    channel: userId,
    user: userId,
    text: copy.ACTIONS.createdGroupChat(selectedUserIds.length),
  });
}

export function handleSelectDefaultOffice(body: BlockAction) {
  const action = body.actions[0];
  if (action.type !== 'static_select') return;
  const defaultOffice = action.selected_option?.value || undefined;
  const existing = loadUserSettings(body.user.id);
  saveUserSettings(body.user.id, { ...existing, defaultOffice });
}

export function handleSettingsModalSubmit(
  body: SlackViewAction,
  view: ViewOutput,
) {
  const userId = body.user.id;
  const defaultOffice =
    view.state.values[BLOCK_ID.DEFAULT_OFFICE]?.[ACTION_ID.DEFAULT_OFFICE]
      .selected_option?.value;
  const showWeekdaysOnly =
    (
      view.state.values[BLOCK_ID.SHOW_WEEKDAYS_ONLY]?.[
        ACTION_ID.SHOW_WEEKDAYS_ONLY
      ].selected_options as ViewStateSelectedOption[] | undefined
    )?.some(o => o.value === ACTION_ID.SHOW_WEEKDAYS_ONLY) ?? false;
  const showTeamCount =
    (
      view.state.values[BLOCK_ID.SHOW_TEAM_COUNT]?.[ACTION_ID.SHOW_TEAM_COUNT]
        .selected_options as ViewStateSelectedOption[] | undefined
    )?.some(o => o.value === ACTION_ID.SHOW_TEAM_COUNT) ?? false;
  const settings: UserSettings = {
    defaultOffice,
    showWeekdaysOnly,
    showTeamCount,
  };
  saveUserSettings(userId, settings);
}

export function handleCreateEventSubmit(
  body: SlackViewAction,
  view: ViewOutput,
) {
  const userId = body.user.id;
  const eventName = validateInput(
    view.state.values[BLOCK_ID.EVENT_NAME][ACTION_ID.EVENT_NAME].value || '',
  );
  const eventDate =
    view.state.values[BLOCK_ID.EVENT_DATE][ACTION_ID.EVENT_DATE].selected_option
      ?.value || '';
  const eventHour =
    view.state.values[BLOCK_ID.EVENT_TIME_HOUR][ACTION_ID.EVENT_TIME_HOUR]
      .selected_option?.value || '12';
  const eventMinute =
    view.state.values[BLOCK_ID.EVENT_TIME_MINUTE][ACTION_ID.EVENT_TIME_MINUTE]
      .selected_option?.value || '0';
  const eventTime = `${eventHour.padStart(2, '0')}:${eventMinute.padStart(2, '0')}`;
  const eventDescription = validateInput(
    view.state.values[BLOCK_ID.EVENT_DESCRIPTION][ACTION_ID.EVENT_DESCRIPTION]
      .value || '',
  );

  const event: OfficeEvent = {
    name: eventName,
    date: eventDate,
    time: eventTime,
    creatorId: userId,
    description: eventDescription,
    attendees: [],
  };

  saveEvent(event);
}

export function handleEventAttendanceToggle(body: BlockAction) {
  const action = body.actions[0];
  if (action.type !== 'checkboxes') return;

  const actionId = action.action_id;
  const eventIdStr = actionId.split('_').pop();
  if (!eventIdStr) return;

  const eventId = parseInt(eventIdStr, 10);
  const event = loadEventById(eventId);
  if (!event) return;

  const userId = body.user.id;
  const isChecked = action.selected_options.length > 0;

  let attendees = event.attendees || [];

  if (isChecked) {
    if (!attendees.includes(userId)) {
      attendees.push(userId);
    }

    const allPresences = loadAllPresences();
    const userPresences = allPresences[userId];
    const hasPresence = userPresences && userPresences[event.date];

    if (!hasPresence) {
      savePresence(userId, event.date, {} as UserPresence);
    }
  } else {
    attendees = attendees.filter(id => id !== userId);
  }

  updateEventAttendees(eventId, attendees);
}

export function handleDeleteEvent(body: BlockAction) {
  const action = body.actions[0];
  const actionId = action.action_id;
  const eventIdStr = actionId.split('_').pop();
  if (!eventIdStr) return;

  const eventId = parseInt(eventIdStr, 10);
  deleteEvent(eventId);
}

export function handleEditEventSubmit(
  eventId: number,
  body: SlackViewAction,
  view: ViewOutput,
) {
  const eventName = validateInput(
    view.state.values[BLOCK_ID.EVENT_NAME][ACTION_ID.EVENT_NAME].value || '',
  );
  const eventDate =
    view.state.values[BLOCK_ID.EVENT_DATE][ACTION_ID.EVENT_DATE].selected_option
      ?.value || '';
  const eventHour =
    view.state.values[BLOCK_ID.EVENT_TIME_HOUR][ACTION_ID.EVENT_TIME_HOUR]
      .selected_option?.value || '12';
  const eventMinute =
    view.state.values[BLOCK_ID.EVENT_TIME_MINUTE][ACTION_ID.EVENT_TIME_MINUTE]
      .selected_option?.value || '0';
  const eventTime = `${eventHour.padStart(2, '0')}:${eventMinute.padStart(2, '0')}`;
  const eventDescription = validateInput(
    view.state.values[BLOCK_ID.EVENT_DESCRIPTION][ACTION_ID.EVENT_DESCRIPTION]
      .value || '',
  );
  const selectedUsers =
    view.state.values[BLOCK_ID.EVENT_ATTENDEES][ACTION_ID.EVENT_ATTENDEES]
      .selected_users || [];

  const event: OfficeEvent = {
    name: eventName,
    date: eventDate,
    time: eventTime,
    creatorId: body.user.id,
    description: eventDescription,
    attendees: selectedUsers,
  };

  updateEvent(eventId, event);
}
