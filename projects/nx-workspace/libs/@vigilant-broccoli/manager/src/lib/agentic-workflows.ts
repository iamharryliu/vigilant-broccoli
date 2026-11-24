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

// Not agentic, so it is absent from the README's Agentic table, but it is what
// ships a merged agentic PR to production.
const DEPLOY_PHASE: AgenticPhase = {
  name: 'Deploy',
  workflows: [
    {
      name: 'deploy-release',
      summary:
        'Verify staging, then deploy the current main commit to production.',
      url: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-release.yml',
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

// Dispatchable ci-, cron-, deploy- and manual- workflow names from .github/workflows.
export const DISPATCHABLE_WORKFLOW_NAMES: string[] = generated.workflowNames;
