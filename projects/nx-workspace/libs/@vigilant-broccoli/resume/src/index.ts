// The owner's resume is personal data, so it lives with the notes rather than in the lib.
// eslint-disable-next-line @nx/enforce-module-boundaries
import resumeJson from '../../../../../../notes/personal/career/resume.json';
import { ResumeData } from './resume.types';

export * from './resume.types';
export * from './resume.schema';
export * from './resume.pdf.types';
export * from './resume.experience';

export const resumeData: ResumeData = resumeJson;
