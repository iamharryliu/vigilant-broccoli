export const STAGING = 'staging';

// Non-secret Render service ids (`srv-...`, shown in the service's dashboard
// URL), keyed by nx project then environment. Pilot: llm-service staging only.
export const renderServices: Record<string, Record<string, string>> = {
  'llm-service': {
    [STAGING]: 'srv-REPLACE_WITH_RENDER_SERVICE_ID',
  },
};
