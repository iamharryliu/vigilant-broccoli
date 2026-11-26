const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Soft-deleted items older than this are purged for good.
export const SOFT_DELETE_RETENTION_MS = RETENTION_DAYS * MS_PER_DAY;

export const softDeleteCutoff = () =>
  new Date(Date.now() - SOFT_DELETE_RETENTION_MS);
