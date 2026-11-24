// URLs whose brief run is queued or running. Next bundles each route
// separately, so a module-level set would give every route its own copy.
const globalStore = globalThis as typeof globalThis & {
  jobHuntBriefsInFlight?: Set<string>;
};

const getInFlight = () => (globalStore.jobHuntBriefsInFlight ??= new Set());

export const isMatchBriefRunning = (url: string) => getInFlight().has(url);
export const markMatchBriefRunning = (url: string) => getInFlight().add(url);
export const unmarkMatchBriefRunning = (url: string) =>
  getInFlight().delete(url);
