'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  Button,
  GoogleTasksAuthAdapter,
  GoogleTasksComponent,
  Select,
  Switch,
  Text,
} from '@vigilant-broccoli/react-lib';

const AUTH_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
} as const;

const SCENARIO = {
  SIGNED_IN: 'signedIn',
  TOKEN_EXPIRED: 'tokenExpired',
  SIGNED_OUT: 'signedOut',
  LOADING: 'loading',
} as const;

type Scenario = (typeof SCENARIO)[keyof typeof SCENARIO];

const SCENARIO_OPTIONS = Object.values(SCENARIO);

const SCENARIO_LABELS: Record<Scenario, string> = {
  [SCENARIO.SIGNED_IN]: 'Signed in',
  [SCENARIO.TOKEN_EXPIRED]: 'Access token expired',
  [SCENARIO.SIGNED_OUT]: 'Signed out',
  [SCENARIO.LOADING]: 'Loading session',
};

const SCENARIO_AUTH_STATUS: Record<
  Scenario,
  ReturnType<GoogleTasksAuthAdapter['useAuthStatus']>
> = {
  [SCENARIO.SIGNED_IN]: AUTH_STATUS.AUTHENTICATED,
  [SCENARIO.TOKEN_EXPIRED]: AUTH_STATUS.AUTHENTICATED,
  [SCENARIO.SIGNED_OUT]: AUTH_STATUS.UNAUTHENTICATED,
  [SCENARIO.LOADING]: AUTH_STATUS.LOADING,
};

const ENDPOINT = {
  TASKS: '/api/tasks',
  TASK_LISTS: '/api/tasks/lists',
  MOVE: '/api/tasks/move',
  PARSE_TEXT: '/api/tasks/parse-text',
  SPEECH_TO_TEXT: '/api/speech-to-text',
} as const;

const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500,
  NOT_FOUND: 404,
} as const;

const LATENCY_MS = {
  READ: 450,
  WRITE: 220,
  PARSE: 700,
} as const;

const TASK_STATUS = {
  ACTIVE: 'needsAction',
  COMPLETED: 'completed',
} as const;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

const ERROR_MESSAGE = {
  UNAUTHORIZED: 'Unauthorized: access token expired',
  WRITE_FAILED: 'Simulated network failure',
  UNKNOWN_ROUTE: 'No mock handler for this route',
};

const MOCK_ACCESS_TOKEN = 'mock-access-token';

const MOCK_TRANSCRIPT =
  'feat: add sandbox demo > fix: flaky drag handle > chore: prune deps';

const DEFAULT_TASK_LIST_ID = '@default';
const TASK_LIST_ID_PARAM = 'taskListId';
const TRANSCRIPT_SEPARATOR = '>';

const MOCK_TASK_LISTS = [
  { id: DEFAULT_TASK_LIST_ID, title: 'My Tasks' },
  { id: 'work-list', title: 'Work' },
  { id: 'home-list', title: 'Home' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

interface MockTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  updated: string;
  status: typeof TASK_STATUS.ACTIVE | typeof TASK_STATUS.COMPLETED;
}

type MockStore = Record<string, MockTask[]>;

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * DAY_MS).toISOString();

const seedStore = (): MockStore => ({
  '@default': [
    {
      id: 'default-1',
      title: 'Q1 fix: renew the expiring TLS certificate',
      notes: 'Blocks the status page checks',
      due: daysFromNow(1),
      updated: daysFromNow(-0.2),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'default-2',
      title: 'Q2 feat: draft the component sandbox walkthrough',
      due: daysFromNow(5),
      updated: daysFromNow(-1),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'default-3',
      title: 'Q3 chore: reply to the vendor questionnaire',
      updated: daysFromNow(-2),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'default-4',
      title: 'Q4 docs: skim the newsletter backlog',
      updated: daysFromNow(-6),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'default-5',
      title: 'Book the dentist appointment',
      notes: 'Ask about the evening slots',
      updated: daysFromNow(-3),
      status: TASK_STATUS.COMPLETED,
    },
  ],
  'work-list': [
    {
      id: 'work-1',
      title: 'Q1 fix: patch the libheif advisory in hearth',
      due: daysFromNow(0),
      updated: daysFromNow(-0.5),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'work-2',
      title: 'Q2 refactor: extract the shared checklist hook',
      updated: daysFromNow(-4),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'work-3',
      title: 'test: cover the drag-and-drop reorder path',
      updated: daysFromNow(-8),
      status: TASK_STATUS.COMPLETED,
    },
  ],
  'home-list': [
    {
      id: 'home-1',
      title: 'Descale the kettle',
      due: daysFromNow(2),
      updated: daysFromNow(-1.5),
      status: TASK_STATUS.ACTIVE,
    },
    {
      id: 'home-2',
      title: 'Restock the banchan containers',
      notes: 'The small glass ones are out',
      updated: daysFromNow(-2.5),
      status: TASK_STATUS.ACTIVE,
    },
  ],
});

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const jsonResponse = (body: unknown, status: number = HTTP_STATUS.OK) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const notFoundResponse = () =>
  jsonResponse({ error: ERROR_MESSAGE.UNKNOWN_ROUTE }, HTTP_STATUS.NOT_FOUND);

const toUrl = (input: RequestInfo | URL) => {
  const raw =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  return new URL(raw, window.location.origin);
};

const parseBody = (init?: RequestInit) =>
  init?.body ? JSON.parse(String(init.body)) : {};

const createTaskId = () =>
  `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const toTaskList = (store: MockStore, taskListId: string) =>
  store[taskListId] ?? [];

interface RouteContext {
  store: MockStore;
  url: URL;
  init?: RequestInit;
}

const handleTaskLists = async () => {
  await delay(LATENCY_MS.READ);
  return jsonResponse({ taskLists: MOCK_TASK_LISTS });
};

const handleSpeechToText = async () => {
  await delay(LATENCY_MS.PARSE);
  return jsonResponse({ transcript: MOCK_TRANSCRIPT });
};

const handleParseText = async ({ init }: RouteContext) => {
  await delay(LATENCY_MS.PARSE);
  const { transcript } = parseBody(init);
  const items = String(transcript ?? '')
    .split(TRANSCRIPT_SEPARATOR)
    .map(item => item.trim())
    .filter(Boolean);
  return jsonResponse({ items });
};

const handleGetTasks = async ({ store, url }: RouteContext) => {
  await delay(LATENCY_MS.READ);
  const taskListId =
    url.searchParams.get(TASK_LIST_ID_PARAM) ?? DEFAULT_TASK_LIST_ID;
  return jsonResponse({ tasks: toTaskList(store, taskListId) });
};

const handleCreateTask = async ({ store, init }: RouteContext) => {
  await delay(LATENCY_MS.WRITE);
  const { taskListId, title } = parseBody(init);
  const task: MockTask = {
    id: createTaskId(),
    title,
    updated: new Date().toISOString(),
    status: TASK_STATUS.ACTIVE,
  };
  store[taskListId] = [task, ...toTaskList(store, taskListId)];
  return jsonResponse({ task });
};

const handleUpdateTask = async ({ store, init }: RouteContext) => {
  await delay(LATENCY_MS.WRITE);
  const { taskListId, taskId, title, status } = parseBody(init);
  const target = toTaskList(store, taskListId).find(task => task.id === taskId);
  if (!target) return notFoundResponse();
  if (title !== undefined) target.title = title;
  if (status !== undefined) target.status = status;
  target.updated = new Date().toISOString();
  return jsonResponse({ task: target });
};

const handleMoveTask = async ({ store, init }: RouteContext) => {
  await delay(LATENCY_MS.WRITE);
  const { taskListId, taskId, previous } = parseBody(init);
  const tasks = toTaskList(store, taskListId);
  const fromIndex = tasks.findIndex(task => task.id === taskId);
  if (fromIndex === -1) return notFoundResponse();
  const [moved] = tasks.splice(fromIndex, 1);
  const previousIndex = previous
    ? tasks.findIndex(task => task.id === previous)
    : -1;
  tasks.splice(previousIndex + 1, 0, moved);
  store[taskListId] = tasks;
  return jsonResponse({ task: moved });
};

const routeKey = (method: string, pathname: string) => `${method} ${pathname}`;

const ROUTE_HANDLERS: Record<
  string,
  (context: RouteContext) => Promise<Response>
> = {
  [routeKey(HTTP_METHOD.GET, ENDPOINT.TASK_LISTS)]: handleTaskLists,
  [routeKey(HTTP_METHOD.POST, ENDPOINT.SPEECH_TO_TEXT)]: handleSpeechToText,
  [routeKey(HTTP_METHOD.POST, ENDPOINT.PARSE_TEXT)]: handleParseText,
  [routeKey(HTTP_METHOD.GET, ENDPOINT.TASKS)]: handleGetTasks,
  [routeKey(HTTP_METHOD.POST, ENDPOINT.TASKS)]: handleCreateTask,
  [routeKey(HTTP_METHOD.PATCH, ENDPOINT.TASKS)]: handleUpdateTask,
  [routeKey(HTTP_METHOD.POST, ENDPOINT.MOVE)]: handleMoveTask,
};

const WRITE_ROUTE_KEYS = new Set([
  routeKey(HTTP_METHOD.POST, ENDPOINT.TASKS),
  routeKey(HTTP_METHOD.PATCH, ENDPOINT.TASKS),
  routeKey(HTTP_METHOD.POST, ENDPOINT.MOVE),
]);

const CONTROL_LABEL = {
  SCENARIO: 'Scenario',
  SELECTOR: 'List selector',
  DRAG_DROP: 'Drag & drop',
  FAIL_WRITES: 'Fail writes',
  RESET: 'Reset mock data',
} as const;

export const TasksDemo = () => {
  const [scenario, setScenario] = useState<Scenario>(SCENARIO.SIGNED_IN);
  const [showSelector, setShowSelector] = useState(true);
  const [enableDragDrop, setEnableDragDrop] = useState(true);
  const [failWrites, setFailWrites] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const storeRef = useRef<MockStore>(seedStore());
  const optionsRef = useRef({ scenario, failWrites });
  optionsRef.current = { scenario, failWrites };

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = toUrl(input);
      const key = routeKey(
        (init?.method ?? HTTP_METHOD.GET).toUpperCase(),
        url.pathname,
      );
      const { scenario: activeScenario, failWrites: writesFail } =
        optionsRef.current;

      if (activeScenario === SCENARIO.TOKEN_EXPIRED) {
        await delay(LATENCY_MS.WRITE);
        return jsonResponse(
          { error: ERROR_MESSAGE.UNAUTHORIZED },
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      if (writesFail && WRITE_ROUTE_KEYS.has(key)) {
        await delay(LATENCY_MS.WRITE);
        return jsonResponse(
          { error: ERROR_MESSAGE.WRITE_FAILED },
          HTTP_STATUS.SERVER_ERROR,
        );
      }

      const handler = ROUTE_HANDLERS[key];
      if (!handler) return notFoundResponse();

      return handler({ store: storeRef.current, url, init });
    },
    [],
  );

  const auth = useMemo<GoogleTasksAuthAdapter>(
    () => ({
      authFetch,
      useAuthStatus: () => SCENARIO_AUTH_STATUS[scenario],
      useGoogleToken: () => ({
        googleToken: scenario === SCENARIO.SIGNED_IN ? MOCK_ACCESS_TOKEN : null,
        clearGoogleToken: () => undefined,
      }),
      signInWithGoogle: async () => setScenario(SCENARIO.SIGNED_IN),
    }),
    [authFetch, scenario],
  );

  const handleReset = () => {
    storeRef.current = seedStore();
    setResetKey(key => key + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Text size="2">{CONTROL_LABEL.SCENARIO}</Text>
          <Select
            selectedOption={scenario}
            setValue={setScenario}
            options={SCENARIO_OPTIONS}
            displayMapper={SCENARIO_LABELS}
          />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showSelector} onCheckedChange={setShowSelector} />
          {CONTROL_LABEL.SELECTOR}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={enableDragDrop}
            onCheckedChange={setEnableDragDrop}
          />
          {CONTROL_LABEL.DRAG_DROP}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={failWrites} onCheckedChange={setFailWrites} />
          {CONTROL_LABEL.FAIL_WRITES}
        </label>
        <Button variant="secondary" onClick={handleReset}>
          {CONTROL_LABEL.RESET}
        </Button>
      </div>
      <GoogleTasksComponent
        key={`${scenario}-${resetKey}`}
        auth={auth}
        showSelector={showSelector}
        enableDragDrop={enableDragDrop}
      />
    </div>
  );
};
