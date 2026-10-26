'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { JobApplicationRun } from '../constants/runs';

const POLL_INTERVAL_MS = 3000;

export const useRuns = () => {
  const [runs, setRuns] = useState<JobApplicationRun[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.JOB_APPLICATIONS_RUNS);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!cancelled) {
          setRuns(data.runs);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { runs, failed };
};
