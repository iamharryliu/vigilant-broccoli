import { createHash } from 'crypto';
import type { StoredBookmarkletPosting } from '@vigilant-broccoli/common-js';
import type {
  PostingBrief,
  PostingBriefState,
} from '../app/constants/saved-postings';
import { getJobHuntDb } from './job-application-runs.db';
import { isPostingBriefRunning } from './posting-brief-inflight';
import {
  listSavedPostings,
  purgeDeletedSavedPostings,
} from './saved-postings.db';
import { softDeleteCutoff } from './soft-delete';

// Named before the Matches page became Job postings; kept to avoid migrating
// existing databases.
const BRIEFS_TABLE = 'job_match_briefs';

interface BriefRow {
  url: string;
  text_hash: string;
  brief: string;
}

const ensureTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${BRIEFS_TABLE} (
      url TEXT PRIMARY KEY,
      text_hash TEXT NOT NULL,
      brief TEXT NOT NULL,
      generated_at TEXT NOT NULL
    )
  `);
  return db;
};

export const hashPostingText = (text: string) =>
  createHash('sha256').update(text).digest('hex');

export const savePostingBrief = (
  url: string,
  textHash: string,
  brief: PostingBrief,
) => {
  ensureTable()
    .prepare(
      `INSERT INTO ${BRIEFS_TABLE} (url, text_hash, brief, generated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET text_hash = excluded.text_hash, brief = excluded.brief, generated_at = excluded.generated_at`,
    )
    .run(url, textHash, JSON.stringify(brief), new Date().toISOString());
};

export const deletePostingBrief = (url: string) => {
  ensureTable().prepare(`DELETE FROM ${BRIEFS_TABLE} WHERE url = ?`).run(url);
};

// Briefs stored before abbreviations existed lack that field, so it defaults
// to empty. A brief belongs to the text it was written from: a recapture that changed
// the posting leaves it stale, so it is not returned.
export const listPostingsWithBriefs = (
  deleted = false,
): (StoredBookmarkletPosting & PostingBriefState)[] => {
  const rows = ensureTable()
    .prepare(`SELECT url, text_hash, brief FROM ${BRIEFS_TABLE}`)
    .all() as unknown as BriefRow[];
  const byUrl = new Map(rows.map(row => [row.url, row]));
  return listSavedPostings(deleted).map(posting => {
    const row = byUrl.get(posting.url);
    return {
      ...posting,
      brief:
        row && row.text_hash === hashPostingText(posting.text)
          ? ({
              abbreviations: [],
              employmentType: '',
              ...JSON.parse(row.brief),
            } as PostingBrief)
          : null,
      briefRunning: isPostingBriefRunning(posting.url),
    };
  });
};

// Cleanup for soft-deleted postings: runs when the list is read, so no
// scheduler is needed.
export const purgeExpiredSavedPostings = () =>
  purgeDeletedSavedPostings(softDeleteCutoff().toISOString()).forEach(
    deletePostingBrief,
  );
