'use client';

import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';
import {
  COMMAND_LABEL,
  COMMAND_NAME,
  TASKS_API_PATH,
  TASKS_CANCELLED_MESSAGE,
  TASKS_CREATE_ERROR_MESSAGE,
  TASKS_CREATE_LIST_ERROR_MESSAGE,
  TASKS_LISTS_API_PATH,
  TASKS_PARSE_API_PATH,
  TASKS_PARSE_ERROR_MESSAGE,
  TASKS_PARSING_MESSAGE,
} from '../constants/chatbot.consts';
import type { TaskDraftItem } from '../components/task-list-draft-card.component';
import type {
  Message,
  MessageImage,
  SetMessages,
  TasksCreateParams,
} from '../components/chatbot/chatbot.types';
import {
  patchLastMessage,
  patchMessageAt,
} from '@vigilant-broccoli/react-lib-higher-level';

const pluralizeTasks = (count: number) => `task${count === 1 ? '' : 's'}`;

export const useTaskDrafts = (setMessages: SetMessages) => {
  const parseTasks = async (text: string, images: MessageImage[]) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      displayContent: COMMAND_LABEL[COMMAND_NAME.TASKS],
      images: images.length > 0 ? images : undefined,
    };
    const pendingAssistant: Message = {
      role: 'assistant',
      content: TASKS_PARSING_MESSAGE,
      isStreaming: true,
    };
    setMessages(prev => [...prev, userMessage, pendingAssistant]);

    try {
      const response = await authFetch(TASKS_PARSE_API_PATH, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          text: text.trim() || undefined,
          images:
            images.length > 0
              ? images.map(img => ({
                  base64: img.data,
                  mimeType: img.mimeType,
                }))
              : undefined,
        }),
      });
      const payload = await response.json();
      const items: string[] | undefined = payload.items;

      if (!response.ok || !items || items.length === 0) {
        patchLastMessage(setMessages, {
          content: payload.error || TASKS_PARSE_ERROR_MESSAGE,
          isStreaming: false,
        });
        return;
      }

      const taskDrafts: TaskDraftItem[] = items.map(title => ({ title }));
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: `Review the ${taskDrafts.length} ${pluralizeTasks(
            taskDrafts.length,
          )} below and pick a Google Tasks list.`,
          isStreaming: false,
          taskDrafts,
          taskStatus: 'draft',
        },
      ]);
    } catch (err) {
      patchLastMessage(setMessages, {
        content: err instanceof Error ? err.message : TASKS_PARSE_ERROR_MESSAGE,
        isStreaming: false,
      });
    }
  };

  const createTasks = async (
    messageIndex: number,
    params: TasksCreateParams,
  ) => {
    patchMessageAt(setMessages, messageIndex, {
      taskDrafts: params.tasks,
      taskStatus: 'creating',
      taskError: undefined,
    });

    try {
      let listId = params.targetListId;
      let listTitle: string | undefined;

      if (!listId) {
        const createListRes = await authFetch(TASKS_LISTS_API_PATH, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({ title: params.newListTitle }),
        });
        const createListPayload = await createListRes.json();
        if (!createListRes.ok) {
          throw new Error(
            createListPayload.error || TASKS_CREATE_LIST_ERROR_MESSAGE,
          );
        }
        listId = createListPayload.taskList?.id;
        listTitle = createListPayload.taskList?.title;
        if (!listId) throw new Error(TASKS_CREATE_LIST_ERROR_MESSAGE);
      }

      for (const task of params.tasks) {
        const res = await authFetch(TASKS_API_PATH, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({ taskListId: listId, title: task.title }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload.error || `Failed to create task: ${task.title}`,
          );
        }
      }

      const created = `Created ${params.tasks.length} ${pluralizeTasks(
        params.tasks.length,
      )}`;
      patchMessageAt(setMessages, messageIndex, {
        taskStatus: 'created',
        taskCreatedSummary: listTitle
          ? `${created} in new list "${listTitle}".`
          : `${created}.`,
      });
    } catch (error) {
      patchMessageAt(setMessages, messageIndex, {
        taskStatus: 'error',
        taskError:
          error instanceof Error ? error.message : TASKS_CREATE_ERROR_MESSAGE,
      });
    }
  };

  const cancelTasks = (messageIndex: number) =>
    patchMessageAt(setMessages, messageIndex, {
      taskDrafts: undefined,
      taskStatus: undefined,
      taskError: undefined,
      content: TASKS_CANCELLED_MESSAGE,
    });

  return { parseTasks, createTasks, cancelTasks };
};
