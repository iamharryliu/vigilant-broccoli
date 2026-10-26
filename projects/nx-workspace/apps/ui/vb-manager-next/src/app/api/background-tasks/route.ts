import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  listEventCalendars,
  listSyncRuns,
} from '../../../lib/event-calendars.db';
import { getSyncStatus } from '../../../lib/event-scraper/sync-runner';
import { listJobApplicationTasks } from '../../../lib/job-application-runner';
import {
  BackgroundTask,
  TASK_KIND,
  TASK_STATUS,
  TaskStatus,
} from '../../constants/background-tasks';
import {
  SYNC_RUN_STATUS,
  SyncRun,
  SyncRunStatus,
} from '../../constants/event-calendars';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYNC_HISTORY_LIMIT = 10;

const TASK_STATUS_BY_SYNC_STATUS: Record<SyncRunStatus, TaskStatus> = {
  [SYNC_RUN_STATUS.RUNNING]: TASK_STATUS.RUNNING,
  [SYNC_RUN_STATUS.SUCCESS]: TASK_STATUS.SUCCEEDED,
  [SYNC_RUN_STATUS.PARTIAL]: TASK_STATUS.PARTIAL,
  [SYNC_RUN_STATUS.FAILED]: TASK_STATUS.FAILED,
};

const toSyncTask = (
  run: SyncRun,
  calendarNames: Record<string, string>,
): BackgroundTask => {
  const lines = run.results.map(
    result =>
      `${calendarNames[result.calendarId] ?? result.calendarId}: ${result.message}`,
  );
  const liveMessage = run.currentCalendarId
    ? getSyncStatus(run.currentCalendarId)?.message
    : undefined;
  if (run.status === SYNC_RUN_STATUS.RUNNING && liveMessage) {
    lines.push(
      `${calendarNames[run.currentCalendarId as string] ?? run.currentCalendarId}: ${liveMessage}`,
    );
  }
  return {
    id: `calendar-sync-${run.id}`,
    kind: TASK_KIND.CALENDAR_SYNC,
    title: `Calendar sync (${run.trigger})`,
    status: TASK_STATUS_BY_SYNC_STATUS[run.status],
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    output: lines.join('\n'),
  };
};

const OMIT_OUTPUT_PARAM = 'omitOutput';

export async function GET(req: NextRequest) {
  try {
    const [runs, calendars] = await Promise.all([
      listSyncRuns(SYNC_HISTORY_LIMIT),
      listEventCalendars(),
    ]);
    const calendarNames = Object.fromEntries(
      calendars.map(calendar => [calendar.id, calendar.name]),
    );
    const tasks = [
      ...listJobApplicationTasks(),
      ...runs.map(run => toSyncTask(run, calendarNames)),
    ].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    // The completion poller only needs statuses; outputs are up to 20k
    // characters per run.
    return NextResponse.json({
      tasks: req.nextUrl.searchParams.has(OMIT_OUTPUT_PARAM)
        ? tasks.map(({ output: _output, ...task }) => task)
        : tasks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
