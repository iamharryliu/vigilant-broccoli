import {
  APPLICATION_STATUSES,
  ApplicationStatus,
} from '../app/constants/applications';
import { getJobHuntDb } from './job-application-runs.db';

const APPLICATIONS_TABLE = 'job_applications';

interface ApplicationStateRow {
  folder: string;
  status: ApplicationStatus;
}

export const isApplicationStatus = (
  value: string | null,
): value is ApplicationStatus =>
  APPLICATION_STATUSES.some(status => status === value);

// Folders without a row have no status.
export const listApplicationStatuses = (): Record<string, ApplicationStatus> =>
  Object.fromEntries(
    (
      getJobHuntDb()
        .prepare(`SELECT folder, status FROM ${APPLICATIONS_TABLE}`)
        .all() as unknown as ApplicationStateRow[]
    ).map(({ folder, status }) => [folder, status]),
  );

export const setApplicationStatus = (
  folder: string,
  status: ApplicationStatus,
) => {
  getJobHuntDb()
    .prepare(
      `INSERT INTO ${APPLICATIONS_TABLE} (folder, status, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(folder) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    )
    .run(folder, status, new Date().toISOString());
};

export const clearApplicationStatus = (folder: string) => {
  getJobHuntDb()
    .prepare(`DELETE FROM ${APPLICATIONS_TABLE} WHERE folder = ?`)
    .run(folder);
};
