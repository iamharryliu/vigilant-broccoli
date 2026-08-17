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
}

export interface ResumeData {
  basics: ResumeBasics;
  workExperience: ResumeWorkExperience[];
  projectExperience: ResumeWorkExperience[];
  skills: ResumeSkills;
}
