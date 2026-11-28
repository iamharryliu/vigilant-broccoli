// URLs whose brief run is queued or running. Next bundles each route
// separately, so a module-level set would give every route its own copy.
const globalStore = globalThis as typeof globalThis & {
  jobHuntBriefsInFlight?: Set<string>;
};

const getInFlight = () => (globalStore.jobHuntBriefsInFlight ??= new Set());

export const isPostingBriefRunning = (url: string) => getInFlight().has(url);
export const markPostingBriefRunning = (url: string) => getInFlight().add(url);
export const unmarkPostingBriefRunning = (url: string) =>
  getInFlight().delete(url);
