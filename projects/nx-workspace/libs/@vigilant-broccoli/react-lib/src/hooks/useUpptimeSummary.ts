import { useEffect, useState } from 'react';
import { UpptimeService } from '../utils/upptime.utils';

export const UPPTIME_SUMMARY_ERROR_TYPE = {
  STATUS: 'status',
  FAILED: 'failed',
} as const;

export type UpptimeSummaryError =
  | { type: typeof UPPTIME_SUMMARY_ERROR_TYPE.STATUS; status: number }
  | { type: typeof UPPTIME_SUMMARY_ERROR_TYPE.FAILED; message: string };

export interface UpptimeSummary {
  services: UpptimeService[] | null;
  error: UpptimeSummaryError | null;
  lastModified: Date | null;
}

export const useUpptimeSummary = (summaryUrl: string): UpptimeSummary => {
  const [summary, setSummary] = useState<UpptimeSummary>({
    services: null,
    error: null,
    lastModified: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // raw.githubusercontent.com caches for minutes; the query busts it.
        const res = await fetch(`${summaryUrl}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (!cancelled)
            setSummary(s => ({
              ...s,
              error: {
                type: UPPTIME_SUMMARY_ERROR_TYPE.STATUS,
                status: res.status,
              },
            }));
          return;
        }
        const header = res.headers.get('last-modified');
        const date = header ? new Date(header) : null;
        const data = await res.json();
        if (cancelled) return;
        setSummary({
          services: Array.isArray(data) ? data : [],
          error: null,
          lastModified: date && !Number.isNaN(date.getTime()) ? date : null,
        });
      } catch (err) {
        if (!cancelled)
          setSummary(s => ({
            ...s,
            error: {
              type: UPPTIME_SUMMARY_ERROR_TYPE.FAILED,
              message: err instanceof Error ? err.message : String(err),
            },
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [summaryUrl]);

  return summary;
};
