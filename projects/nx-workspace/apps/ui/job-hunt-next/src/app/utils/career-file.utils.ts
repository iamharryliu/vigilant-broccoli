import { validateResume } from '@vigilant-broccoli/resume';
import { CAREER_FILE_KIND, CareerFileKind } from '../constants/career';
import { validateCareerExperience } from './career-experience.utils';

const validateResumeText = (content: string): string[] => {
  try {
    const result = validateResume(JSON.parse(content));
    return result.ok ? [] : result.errors;
  } catch (error) {
    return [error instanceof Error ? error.message : 'Invalid JSON'];
  }
};

const VALIDATOR_BY_KIND = {
  [CAREER_FILE_KIND.CAREER_EXPERIENCE]: validateCareerExperience,
  [CAREER_FILE_KIND.RESUME]: validateResumeText,
} as const;

export const validateCareerFile = (kind: CareerFileKind, content: string) =>
  VALIDATOR_BY_KIND[kind](content);

export const isCareerFileKind = (value: unknown): value is CareerFileKind =>
  Object.values(CAREER_FILE_KIND).includes(value as CareerFileKind);
