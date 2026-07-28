export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  title: string;
  email: string;
  phone: string;
  links: ResumeLink[];
}

export interface ResumeWorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
}

export interface ResumePersonalProject {
  name: string;
  url: string;
  tags?: string;
  tagline?: string;
  bullets: string[];
}

export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  workExperience: ResumeWorkExperience[];
  skills: ResumeSkills;
  personalProjects: ResumePersonalProject[];
}
