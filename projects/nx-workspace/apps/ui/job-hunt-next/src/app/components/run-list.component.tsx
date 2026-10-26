'use client';

import { Badge, Card, CopyButton } from '@vigilant-broccoli/react-lib';
import { JobApplicationRun, RUN_STATUS, RunStatus } from '../constants/runs';
import { useRuns } from '../hooks/use-runs';
import { useTranslation } from '../i18n';

const STATUS_BADGE = {
  [RUN_STATUS.RUNNING]: { color: 'blue', key: 'RUNS.STATUS.RUNNING' },
  [RUN_STATUS.SUCCEEDED]: { color: 'green', key: 'RUNS.STATUS.SUCCEEDED' },
  [RUN_STATUS.FAILED]: { color: 'red', key: 'RUNS.STATUS.FAILED' },
} as const satisfies Record<RunStatus, unknown>;

const RunCard = ({ run }: { run: JobApplicationRun }) => {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[run.status];
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">
          {run.title}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Badge color={badge.color} variant="soft" size="1">
            {t(badge.key)}
          </Badge>
          {/* Application-question answers end up here, not in a file. */}
          <CopyButton text={run.output} disabled={!run.output} />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('RUNS.STARTED_AT', {
          time: new Date(run.startedAt).toLocaleString(),
        })}
      </span>
      {run.output && (
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
          {run.output}
        </pre>
      )}
    </Card>
  );
};

export const RunList = () => {
  const { t } = useTranslation();
  const { runs, failed } = useRuns();
  if (failed && !runs) {
    return <p className="text-sm text-destructive">{t('RUNS.LOAD_FAILED')}</p>;
  }
  if (!runs) return null;
  if (!runs.length) {
    return <p className="text-sm text-muted-foreground">{t('RUNS.EMPTY')}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {runs.map(run => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  );
};
