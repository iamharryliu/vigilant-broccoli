import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseSkillsNote } from '../../../../lib/resume-chat.skills-note';
import type { SkillsNote } from '../../../../lib/resume-chat.skills-note';

const SKILLS_NOTE_PATH = path.join(
  'notes',
  'personal',
  'personal-software-career-experience.md',
);
const FILE_ENCODING = 'utf-8';

const findSkillsNotePath = (directory: string): string | undefined => {
  const candidate = path.join(directory, SKILLS_NOTE_PATH);
  if (existsSync(candidate)) return candidate;
  const parent = path.dirname(directory);
  return parent === directory ? undefined : findSkillsNotePath(parent);
};

/**
 * Read live on every request so an edit to the note applies without a rebuild.
 * The app only runs from this checkout, so walking up from the working
 * directory finds it in both `next dev` and the PM2 `dist/` process; when it is
 * absent the editor falls back to the resume and conversation alone.
 */
export const loadSkillsNote = async (): Promise<SkillsNote | undefined> => {
  const notePath = findSkillsNotePath(process.cwd());
  return notePath
    ? parseSkillsNote(await readFile(notePath, FILE_ENCODING))
    : undefined;
};
