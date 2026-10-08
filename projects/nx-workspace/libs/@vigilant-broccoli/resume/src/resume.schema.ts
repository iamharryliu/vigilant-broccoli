import { z } from 'zod';
import type { ResumeData } from './resume.types';

const HTTP_URL_PATTERN = /^https?:\/\//i;

const linkSchema = z.object({
  label: z.string(),
  url: z.string().regex(HTTP_URL_PATTERN, 'must be an http(s) URL'),
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const resumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    links: z.array(linkSchema),
  }),
  summary: z.string().optional(),
  workExperience: z.array(experienceSchema),
  projectExperience: z.array(experienceSchema),
  skills: z.object({ technical: z.array(z.string()) }),
});

export type ResumeValidationResult =
  { ok: true; resume: ResumeData } | { ok: false; errors: string[] };

const ROOT_PATH_LABEL = 'resume';

export const validateResume = (value: unknown): ResumeValidationResult => {
  const parsed = resumeSchema.safeParse(value);
  if (parsed.success) return { ok: true, resume: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map(
      issue =>
        `${[ROOT_PATH_LABEL, ...issue.path].join('.')}: ${issue.message}`,
    ),
  };
};
