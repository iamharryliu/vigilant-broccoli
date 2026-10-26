import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import {
  CAREER_EXPERIENCE_PATH,
  RESUME_PATH,
  TEMPLATE_PATH,
} from './paths.server';

const FILE_ENCODING = 'utf-8';
const NOT_FOUND = 'ENOENT';

export const CAREER_FILE = {
  CAREER_EXPERIENCE: {
    path: CAREER_EXPERIENCE_PATH,
    template: TEMPLATE_PATH.CAREER_EXPERIENCE,
  },
  RESUME: { path: RESUME_PATH, template: TEMPLATE_PATH.RESUME },
} as const;

type CareerFile = (typeof CAREER_FILE)[keyof typeof CAREER_FILE];

const isNotFound = (error: unknown) =>
  (error as NodeJS.ErrnoException).code === NOT_FOUND;

// A user who mounts nothing starts from the blank template, saved to the
// career volume so in-app edits and the skill's runs share one copy.
export const ensureCareerFile = async ({ path, template }: CareerFile) => {
  try {
    await readFile(path);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await mkdir(dirname(path), { recursive: true });
    await copyFile(template, path);
  }
};

export const ensureCareerFiles = () =>
  Promise.all(Object.values(CAREER_FILE).map(ensureCareerFile));

export const readCareerFile = async (file: CareerFile) => {
  await ensureCareerFile(file);
  return readFile(file.path, FILE_ENCODING);
};

export const writeCareerFile = async (file: CareerFile, content: string) => {
  await mkdir(dirname(file.path), { recursive: true });
  await writeFile(file.path, content, FILE_ENCODING);
};
