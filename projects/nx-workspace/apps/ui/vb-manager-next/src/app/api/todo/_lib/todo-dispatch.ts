import { GithubService } from '@vigilant-broccoli/github-workspace';

const TODO_REPO = 'iamharryliu/vigilant-broccoli';
const MANUAL_AGENTIC_PR_CREATE_WORKFLOW = 'manual-agentic-pr-create.yml';
const TODO_ID_PATTERN = /^[0-9a-fA-F]{6}$/;
const WHITESPACE_RUN_RE = /\s+/g;

export const isTodoId = (id: unknown): id is string =>
  typeof id === 'string' && TODO_ID_PATTERN.test(id);

// The workflow input is the agent prompt and its run name, so the reason is
// flattened to one line.
export const normalizeRemovalReason = (reason: unknown): string =>
  typeof reason === 'string'
    ? reason.replace(WHITESPACE_RUN_RE, ' ').trim()
    : '';

const dispatchAgenticPrCreate = (prompt: string) =>
  GithubService.dispatchWorkflow(TODO_REPO, MANUAL_AGENTIC_PR_CREATE_WORKFLOW, {
    prompt,
  });

export const dispatchTodoSolve = (id: string) =>
  dispatchAgenticPrCreate(`solve ${id.toLowerCase()}`);

// Must match TODO_REMOVAL_REQUEST_RE in infrastructure/agent-sandbox/solve-todo-runner.sh,
// which is what lets this TODO-only PR past the runner's "no changes" guard.
export const dispatchTodoRemoval = (id: string, reason: string) =>
  dispatchAgenticPrCreate(
    `Remove TODO.md row ${id.toLowerCase()}. Reason: ${reason}`,
  );
