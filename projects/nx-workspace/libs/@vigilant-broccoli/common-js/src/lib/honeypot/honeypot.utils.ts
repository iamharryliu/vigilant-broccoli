export const isHoneypotTriggered = (value: unknown): boolean =>
  typeof value === 'string' ? value.trim().length > 0 : value != null;
