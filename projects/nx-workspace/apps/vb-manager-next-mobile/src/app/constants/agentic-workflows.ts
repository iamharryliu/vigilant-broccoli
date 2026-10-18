import generated from '../generated/agentic-workflows.json';

export type AgenticWorkflow = {
  name: string;
  summary: string;
  url: string;
};

export type AgenticPhase = {
  name: string;
  workflows: AgenticWorkflow[];
};

export const AGENTIC_PHASES: AgenticPhase[] = generated.phases;
