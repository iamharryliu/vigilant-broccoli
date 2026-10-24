import {
  BlockAction,
  SlackViewAction,
  ViewOutput,
  ViewStateSelectedOption,
} from '@slack/bolt';
import {
  savePresence,
  savePresenceIfMissing,
  deletePresence,
  runInTransaction,
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
import { AppCopy, LANGUAGE, Language } from '../consts/app-copy.const';
import { ACTION_ID, BLOCK_ID } from '../consts/data.consts';
import { validateInput } from './input-validation.utils';
import { isDemoUserId } from '../consts/demo-users.const';

type RenderedCheckboxBlock = {
  block_id?: string;
  accessory?: { options?: { value?: string }[] };
};

// Only the dates the clicked block rendered: future presences it never showed (weekends
// hidden by the weekdays-only setting, later weeks) must survive the click.
const getRenderedOptionValues = (body: BlockAction, blockId: string) => {
  const blocks = (body.view?.blocks ?? []) as RenderedCheckboxBlock[];
  const block = blocks.find(b => b.block_id === blockId);
  return (block?.accessory?.options ?? []).flatMap(option =>
    option.value ? [option.value] : [],
  );
};

export function handleCheckboxAction(body: BlockAction) {
  const action = body.actions[0];
  if (action.type !== 'checkboxes') return;
  const userId = body.user.id;
  const selectedDates = new Set(
    action.selected_options.map(opt => opt.value as string),
  );
  const { defaultOffice } = loadUserSettings(userId);

  runInTransaction(() => {
    for (const date of getRenderedOptionValues(body, action.block_id)) {
      if (selectedDates.has(date)) {
        savePresenceIfMissing(userId, date, { office: defaultOffice });
      } else {
        deletePresence(userId, date);
      }
    }
  });
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
  allowDemoRecipients = false,
) {
  // Slack rejects (or worse, mis-targets) seeded ids, so only the local mock may address them.
  const recipientIds = allowDemoRecipients
    ? selectedUserIds
    : selectedUserIds.filter(id => !isDemoUserId(id));
  if (recipientIds.length === 0) {
    await client.chat.postEphemeral({
      channel: userId,
      user: userId,
      text: copy.ACTIONS.NO_USERS_SELECTED,
    });
    return;
  }
  const allUserIds = [userId, ...recipientIds];
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
    text: copy.ACTIONS.createdGroupChat(recipientIds.length),
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
  const showWeekdaysOnly = isCheckboxChecked(
    view,
    BLOCK_ID.SHOW_WEEKDAYS_ONLY,
    ACTION_ID.SHOW_WEEKDAYS_ONLY,
  );
  const showTeamCount = isCheckboxChecked(
    view,
    BLOCK_ID.SHOW_TEAM_COUNT,
    ACTION_ID.SHOW_TEAM_COUNT,
  );
  const selectedLanguage =
    view.state.values[BLOCK_ID.LANGUAGE]?.[ACTION_ID.LANGUAGE].selected_option
      ?.value;
  const language = isLanguage(selectedLanguage)
    ? selectedLanguage
    : LANGUAGE.EN;
  const settings: UserSettings = {
    defaultOffice,
    showWeekdaysOnly,
    showTeamCount,
    language,
  };
  saveUserSettings(userId, settings);
}

function isCheckboxChecked(
  view: ViewOutput,
  blockId: string,
  actionId: string,
): boolean {
  const selected = view.state.values[blockId]?.[actionId].selected_options as
    ViewStateSelectedOption[] | undefined;
  return selected?.some(o => o.value === actionId) ?? false;
}

function isLanguage(value?: string): value is Language {
  return Object.values(LANGUAGE).includes(value as Language);
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

    savePresenceIfMissing(userId, event.date, {});
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
