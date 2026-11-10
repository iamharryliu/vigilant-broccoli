'use client';

import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';
import { authFetch } from '../../../libs/auth';
import {
  CALENDAR_EVENTS_API_PATH,
  CALENDAR_PARSE_API_PATH,
  COMMAND_LABEL,
  COMMAND_NAME,
  EVENT_CANCELLED_MESSAGE,
  EVENT_CREATE_ERROR_MESSAGE,
  EVENT_PARSE_ERROR_MESSAGE,
  EVENT_PARSING_MESSAGE,
} from '../constants/chatbot.consts';
import type { EventDraft } from '../components/event-draft-card.component';
import type {
  Message,
  MessageImage,
  SetMessages,
} from '../components/chatbot/chatbot.types';
import {
  buildEventDraftMessages,
  patchLastMessage,
  patchMessageAt,
} from '../utils/chat-messages.utils';

export const useCalendarDrafts = (setMessages: SetMessages) => {
  const parseEvent = async (text: string, images: MessageImage[]) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      displayContent: COMMAND_LABEL[COMMAND_NAME.CALENDAR],
      images: images.length > 0 ? images : undefined,
    };
    const pendingAssistant: Message = {
      role: 'assistant',
      content: EVENT_PARSING_MESSAGE,
      isStreaming: true,
    };
    setMessages(prev => [...prev, userMessage, pendingAssistant]);

    try {
      const response = await authFetch(CALENDAR_PARSE_API_PATH, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          text,
          images: images.length > 0 ? images : undefined,
          timeZone: getLocalTimeZone(),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        patchLastMessage(setMessages, {
          content: payload.error || EVENT_PARSE_ERROR_MESSAGE,
          isStreaming: false,
        });
        return;
      }

      setMessages(prev => [
        ...prev.slice(0, -1),
        ...buildEventDraftMessages((payload.events || []) as EventDraft[]),
      ]);
    } catch (error) {
      patchLastMessage(setMessages, {
        content:
          error instanceof Error ? error.message : EVENT_PARSE_ERROR_MESSAGE,
        isStreaming: false,
      });
    }
  };

  const createEvent = async (messageIndex: number, draft: EventDraft) => {
    patchMessageAt(setMessages, messageIndex, {
      eventDraft: draft,
      eventStatus: 'creating',
      eventError: undefined,
    });

    try {
      const response = await authFetch(CALENDAR_EVENTS_API_PATH, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          summary: draft.summary,
          description: draft.description,
          start: draft.allDay ? draft.start.slice(0, 10) : draft.start,
          end: draft.allDay
            ? draft.end.slice(0, 10) || draft.start.slice(0, 10)
            : draft.end || draft.start,
          timeZone: draft.timeZone,
          location: draft.location,
          allDay: draft.allDay,
          recurrence: draft.recurrence,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        patchMessageAt(setMessages, messageIndex, {
          eventStatus: 'error',
          eventError: payload.error || EVENT_CREATE_ERROR_MESSAGE,
        });
        return;
      }

      patchMessageAt(setMessages, messageIndex, {
        eventStatus: 'created',
        eventLink: payload.event?.htmlLink,
      });
    } catch (error) {
      patchMessageAt(setMessages, messageIndex, {
        eventStatus: 'error',
        eventError:
          error instanceof Error ? error.message : EVENT_CREATE_ERROR_MESSAGE,
      });
    }
  };

  const cancelEvent = (messageIndex: number) =>
    patchMessageAt(setMessages, messageIndex, {
      eventDraft: undefined,
      eventStatus: undefined,
      eventError: undefined,
      content: EVENT_CANCELLED_MESSAGE,
    });

  return { parseEvent, createEvent, cancelEvent };
};
