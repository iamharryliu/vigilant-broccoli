import resumeJson from './resume.json';
import { ResumeData } from './resume.types';

export * from './resume.types';
export * from './resume.schema';
export * from './resume.pdf.types';
export * from './resume.experience';

export const resumeData: ResumeData = resumeJson;
