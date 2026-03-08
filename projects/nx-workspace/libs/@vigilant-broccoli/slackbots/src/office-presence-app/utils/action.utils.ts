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
  updateEventAttendees,
  deleteEvent,
  updateEvent,
} from './db.utils';
import { UserPresence, OfficeEvent } from '../types';
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

export function handleCreateEventSubmit(
  body: SlackViewAction,
  view: ViewOutput,
) {
  const userId = body.user.id;
  const eventName = view.state.values.event_name_block.event_name.value || '';
  const eventDate =
    view.state.values.event_date_block.event_date.selected_option?.value || '';
  const eventHour =
    view.state.values.event_time_hour_block.event_time_hour.selected_option
      ?.value || '12';
  const eventMinute =
    view.state.values.event_time_minute_block.event_time_minute.selected_option
      ?.value || '0';
  const eventTime = `${eventHour.padStart(2, '0')}:${eventMinute.padStart(
    2,
    '0',
  )}`;
  const eventDescription =
    view.state.values.event_description_block.event_description.value || '';

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
  const eventName = view.state.values.event_name_block.event_name.value || '';
  const eventDate =
    view.state.values.event_date_block.event_date.selected_option?.value || '';
  const eventHour =
    view.state.values.event_time_hour_block.event_time_hour.selected_option
      ?.value || '12';
  const eventMinute =
    view.state.values.event_time_minute_block.event_time_minute.selected_option
      ?.value || '0';
  const eventTime = `${eventHour.padStart(2, '0')}:${eventMinute.padStart(
    2,
    '0',
  )}`;
  const eventDescription =
    view.state.values.event_description_block.event_description.value || '';
  const selectedUsers =
    view.state.values.event_attendees_block.event_attendees.selected_users ||
    [];

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
