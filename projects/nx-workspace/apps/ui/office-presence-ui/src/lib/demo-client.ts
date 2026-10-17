import { ENVIRONMENT } from '../environments/environment';
import { getSessionId } from './demo-session';
import { DemoSnapshot, ViewStateValues } from './demo.types';

const DEMO_PATH = '/demo';
const SESSION_HEADER = 'x-demo-session';

export const DEMO_OPERATION = {
  STATE: 'state',
  ACTION: 'action',
  SUBMIT: 'submit',
  CLOSE_MODAL: 'close-modal',
  PREVIEW_REMINDER: 'preview-reminder',
  RESET: 'reset',
} as const;
type DemoOperation = (typeof DEMO_OPERATION)[keyof typeof DEMO_OPERATION];

export type BlockAction = {
  type: string;
  action_id?: string;
  block_id?: string;
  value?: string;
  selected_options?: { value: string }[];
  selected_option?: { value: string } | null;
};

const call = async (
  operation: DemoOperation,
  userId: string | null,
  body: Record<string, unknown> = {},
): Promise<DemoSnapshot> => {
  const response = await fetch(
    `${ENVIRONMENT.API_URL}${DEMO_PATH}/${operation}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SESSION_HEADER]: getSessionId(),
      },
      body: JSON.stringify({ ...(userId ? { user: userId } : {}), ...body }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed (${response.status})`);
  }
  return payload as DemoSnapshot;
};

export const demoClient = {
  state: (userId: string | null) => call(DEMO_OPERATION.STATE, userId),
  action: (userId: string, action: BlockAction) =>
    call(DEMO_OPERATION.ACTION, userId, { action }),
  submit: (userId: string, callbackId: string, values: ViewStateValues) =>
    call(DEMO_OPERATION.SUBMIT, userId, { callbackId, state: { values } }),
  closeModal: (userId: string) => call(DEMO_OPERATION.CLOSE_MODAL, userId),
  previewReminder: (userId: string) =>
    call(DEMO_OPERATION.PREVIEW_REMINDER, userId),
  reset: (userId: string) => call(DEMO_OPERATION.RESET, userId),
};
