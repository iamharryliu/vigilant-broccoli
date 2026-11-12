import {
  MATCH_SKILL_STATUS,
  type MatchSkill,
  type MatchSkillStatus,
} from '../app/constants/matches';
import { getJobHuntDb } from './job-application-runs.db';

const SKILLS_TABLE = 'job_match_skills';

interface SkillRow {
  name: string;
  aliases: string;
  status: MatchSkillStatus;
  postings: number;
}

const ensureTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${SKILLS_TABLE} (
      name TEXT PRIMARY KEY COLLATE NOCASE,
      aliases TEXT NOT NULL,
      status TEXT NOT NULL,
      postings INTEGER NOT NULL DEFAULT 0
    )
  `);
  return db;
};

export const listMatchSkills = (): MatchSkill[] =>
  (
    ensureTable()
      .prepare(`SELECT * FROM ${SKILLS_TABLE} ORDER BY postings DESC, name`)
      .all() as unknown as SkillRow[]
  ).map(row => ({ ...row, aliases: JSON.parse(row.aliases) }));

// A skill already stored keeps its status, so a dismissed one is not
// suggested again by a later run.
export const addSuggestedSkills = (
  skills: Pick<MatchSkill, 'name' | 'aliases' | 'postings'>[],
) => {
  const insert = ensureTable().prepare(
    `INSERT OR IGNORE INTO ${SKILLS_TABLE} (name, aliases, status, postings) VALUES (?, ?, ?, ?)`,
  );
  skills.forEach(({ name, aliases, postings }) =>
    insert.run(
      name,
      JSON.stringify(aliases),
      MATCH_SKILL_STATUS.SUGGESTED,
      postings,
    ),
  );
};

export const setMatchSkillStatus = (name: string, status: MatchSkillStatus) =>
  Number(
    ensureTable()
      .prepare(`UPDATE ${SKILLS_TABLE} SET status = ? WHERE name = ?`)
      .run(status, name).changes,
  ) > 0;

// Accepted and dismissed skills stay: accepted ones are part of the user's
// vocabulary, and dismissed ones keep a later run from suggesting them again.
export const deleteSuggestedMatchSkills = () => {
  ensureTable()
    .prepare(`DELETE FROM ${SKILLS_TABLE} WHERE status = ?`)
    .run(MATCH_SKILL_STATUS.SUGGESTED);
};

export const deleteMatchSkill = (name: string) => {
  ensureTable().prepare(`DELETE FROM ${SKILLS_TABLE} WHERE name = ?`).run(name);
};
