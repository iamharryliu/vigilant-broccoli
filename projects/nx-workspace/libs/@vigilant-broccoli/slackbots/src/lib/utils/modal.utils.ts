import {
  Middleware,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  BlockAction,
  BlockElementAction,
} from '@slack/bolt';
import { View } from '@slack/types';

function createModalHandlerGeneric<
  T extends
    | SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>
    | SlackCommandMiddlewareArgs,
>(modalFactory: (args: T) => View): Middleware<T> {
  return async function (args) {
    const { ack, body, client } = args;
    await ack();
    const view = modalFactory(args);
    await client.views.open({
      trigger_id: body.trigger_id,
      view,
    });
  };
}

function createModalHandler(modalFactory: () => View) {
  return createModalHandlerGeneric<
    SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>
  >(function () {
    return modalFactory();
  });
}

function createModalHandlerWithUserId(modalFactory: (userId: string) => View) {
  return createModalHandlerGeneric<
    SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>
  >(function ({ body }) {
    return modalFactory(body.user.id);
  });
}

function createModalHandlerWithChannelId(
  modalFactory: (channelId: string) => View,
) {
  return createModalHandlerGeneric<SlackCommandMiddlewareArgs>(function ({
    command,
  }) {
    return modalFactory(command.channel_id);
  });
}

function createModalHandlerWithActionValue<T extends object>(
  modalFactory: (parsedValue: T) => View,
): Middleware<SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>> {
  return async function ({ ack, body, client }) {
    await ack();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawValue = (body.actions?.[0] as any)?.value ?? '{}';
    const parsed: T = safeJsonParse<T>(rawValue, {} as T);
    const view = modalFactory(parsed);
    await client.views.open({
      trigger_id: body.trigger_id,
      view,
    });
  };
}

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export const SlackModalUtils = {
  createModalHandler,
  createModalHandlerWithUserId,
  createModalHandlerWithChannelId,
  createModalHandlerWithActionValue,
};
