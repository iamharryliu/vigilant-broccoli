import generated from './generated/agentic-workflows.json';

export type AgenticWorkflow = {
  name: string;
  summary: string;
  url: string;
};

export type AgenticPhase = {
  name: string;
  workflows: AgenticWorkflow[];
};

// Not agentic, so it is absent from the README's Agentic table, but it is the
// usual next step after merging an agentic PR.
const DEPLOY_PHASE: AgenticPhase = {
  name: 'Deploy',
  workflows: [
    {
      name: 'manual-promote-production',
      summary: 'Fast-forward production to the current main commit.',
      url: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-promote-production.yml',
    },
  ],
};

const MAINTAIN_PHASE_NAME = 'Maintain';
// The smoke-test workflow only exercises the pipeline; omit it from the home workflow list.
const HIDDEN_PHASE_NAMES = ['Test'];

const readmePhases = generated.phases.filter(
  phase => !HIDDEN_PHASE_NAMES.includes(phase.name),
);

// Keep lifecycle order: Deploy sits before Maintain (or last if it is absent).
const maintainIndex = readmePhases.findIndex(
  phase => phase.name === MAINTAIN_PHASE_NAME,
);
const deployIndex = maintainIndex === -1 ? readmePhases.length : maintainIndex;

export const AGENTIC_PHASES: AgenticPhase[] = [
  ...readmePhases.slice(0, deployIndex),
  DEPLOY_PHASE,
  ...readmePhases.slice(deployIndex),
];
