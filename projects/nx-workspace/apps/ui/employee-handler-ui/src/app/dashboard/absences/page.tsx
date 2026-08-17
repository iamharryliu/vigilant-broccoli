'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Card } from '@radix-ui/themes';
import { Text, useTheme } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import type { EmployeeAbsence } from '@vigilant-broccoli/employee-handler';
import { authFetchOk } from '../../../lib/api-helpers';
import { useTranslation } from '../../i18n';
import styles from './absences.module.css';
import {
  buildLegend,
  buildMonths,
  daysBetween,
  fmtDate,
  groupByEmployee,
  parseDate,
  computeRange,
} from './absences.utils';

const ABSENCES_ENDPOINT = '/api/absences';
const PAGE_CONTAINER = 'max-w-6xl mx-auto p-8 space-y-4';
const SIDEBAR_WIDTH = 240;

const LIGHT_TOKENS: Record<string, string> = {
  '--vb-surface': '#fcfcfb',
  '--vb-border': 'rgba(11,11,11,0.10)',
  '--vb-text': '#0b0b0b',
  '--vb-text-secondary': '#52514e',
  '--vb-text-muted': '#898781',
  '--vb-gridline': '#e1e0d9',
  '--vb-baseline': '#c3c2b7',
  '--vb-series-1': '#2a78d6',
  '--vb-series-2': '#eb6834',
  '--vb-series-3': '#1baf7a',
  '--vb-series-4': '#eda100',
  '--vb-series-5': '#e87ba4',
  '--vb-series-6': '#008300',
  '--vb-series-7': '#4a3aa7',
  '--vb-series-8': '#e34948',
};

const DARK_TOKENS: Record<string, string> = {
  '--vb-surface': '#1a1a19',
  '--vb-border': 'rgba(255,255,255,0.10)',
  '--vb-text': '#ffffff',
  '--vb-text-secondary': '#c3c2b7',
  '--vb-text-muted': '#898781',
  '--vb-gridline': '#2c2c2a',
  '--vb-baseline': '#383835',
  '--vb-series-1': '#3987e5',
  '--vb-series-2': '#d95926',
  '--vb-series-3': '#199e70',
  '--vb-series-4': '#c98500',
  '--vb-series-5': '#d55181',
  '--vb-series-6': '#008300',
  '--vb-series-7': '#9085e9',
  '--vb-series-8': '#e66767',
};

const seriesVar = (slot: number) => `var(--vb-series-${slot + 1})`;

export default function AbsencesPage() {
  const { t } = useTranslation();
  const { appearance } = useTheme();
  const [absences, setAbsences] = useState<EmployeeAbsence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetchOk(ABSENCES_ENDPOINT)
      .then(res => res.json())
      .then(json => setAbsences((json.absences ?? []) as EmployeeAbsence[]))
      .catch(() => toast.error(t('ABSENCES.ERROR.LOAD_FAILED')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => groupByEmployee(absences), [absences]);
  const today = useMemo(() => parseDate(fmtDate(new Date())), []);
  const { rangeStart, rangeEnd, pxPerDay } = useMemo(
    () => computeRange(groups, today),
    [groups, today],
  );
  const months = useMemo(
    () => buildMonths(rangeStart, rangeEnd, pxPerDay),
    [rangeStart, rangeEnd, pxPerDay],
  );
  const legend = useMemo(() => buildLegend(groups), [groups]);

  const totalDays = daysBetween(rangeStart, rangeEnd);
  const timelineWidth = Math.round(totalDays * pxPerDay);
  const bodyHeight = groups.length * 34;
  const todayOffset = daysBetween(rangeStart, today);
  const todayInRange = todayOffset >= 0 && todayOffset <= totalDays;
  const todayLeft = Math.round(todayOffset * pxPerDay);
  const totalAbsences = absences.length;

  const rootStyle = {
    ...(appearance === 'dark' ? DARK_TOKENS : LIGHT_TOKENS),
  } as CSSProperties;

  if (loading) {
    return (
      <div className={PAGE_CONTAINER}>
        <Text size="2" color="gray">
          {t('COMMON.LOADING')}
        </Text>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={PAGE_CONTAINER}>
        <Text size="2" color="gray">
          {t('ABSENCES.EMPTY')}
        </Text>
      </div>
    );
  }

  return (
    <div className={`${PAGE_CONTAINER} ${styles.root}`} style={rootStyle}>
      <Text size="2" color="gray">
        {t('ABSENCES.SUBTITLE')}
      </Text>
      <p className={styles.summary}>
        {t('ABSENCES.SUMMARY', {
          employees: groups.length,
          absences: totalAbsences,
        })}
      </p>

      <Card className={styles.panel}>
        <div className={styles.ganttScroll}>
          <div
            className={styles.ganttGrid}
            style={{ width: SIDEBAR_WIDTH + timelineWidth }}
          >
            <div className={styles.headerRow}>
              <div className={styles.cornerCell}>
                {t('ABSENCES.COL.EMPLOYEE')}
              </div>
              <div
                className={styles.timelineHeader}
                style={{ width: timelineWidth }}
              >
                {months.map(m => (
                  <div
                    key={m.label}
                    className={styles.monthLabel}
                    style={{ left: m.left }}
                  >
                    {m.label}
                  </div>
                ))}
                {todayInRange && (
                  <div className={styles.todayChip} style={{ left: todayLeft }}>
                    {t('ABSENCES.TODAY')} · {fmtDate(today)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.bodyRows}>
              <div
                className={styles.gridlinesOverlay}
                style={{ width: timelineWidth, height: bodyHeight }}
              >
                {months.map(m => (
                  <div
                    key={m.label}
                    className={`${styles.gridline} ${m.isJan ? styles.gridlineYear : ''}`}
                    style={{ left: m.left }}
                  />
                ))}
              </div>
              <div
                className={styles.todayLineOverlay}
                style={{ width: timelineWidth, height: bodyHeight }}
              >
                {todayInRange && (
                  <div
                    className={styles.todayLine}
                    style={{ left: todayLeft }}
                  />
                )}
              </div>

              {groups.map(group => (
                <div className={styles.row} key={group.email}>
                  <div className={styles.sidebarCell}>
                    <div className={styles.empName}>{group.name}</div>
                    <div className={styles.empMeta}>
                      {t('ABSENCES.ROW_META', { count: group.absences.length })}
                    </div>
                  </div>
                  <div
                    className={styles.track}
                    style={{ width: timelineWidth }}
                  >
                    {group.absences.map(a => {
                      const left = Math.round(
                        daysBetween(rangeStart, a.startD) * pxPerDay,
                      );
                      const widthDays = daysBetween(a.startD, a.endD) + 1;
                      const width = Math.max(
                        8,
                        Math.round(widthDays * pxPerDay),
                      );
                      const tooltip = `${a.type} • ${fmtDate(a.startD)} → ${fmtDate(a.endD)} (${widthDays}d)`;
                      return (
                        <div
                          key={a.id}
                          className={styles.bar}
                          tabIndex={0}
                          role="img"
                          style={{ left, width, background: seriesVar(a.slot) }}
                          data-tooltip={tooltip}
                          aria-label={`${group.name}: ${tooltip}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.legend}>
        {legend.map(entry => (
          <div className={styles.legendItem} key={entry.slot}>
            <span
              className={styles.legendSwatch}
              style={{ background: seriesVar(entry.slot) }}
            />
            {entry.label}
          </div>
        ))}
      </div>

      <details className={styles.tableView}>
        <summary>{t('ABSENCES.TABLE_VIEW')}</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('ABSENCES.COL.EMPLOYEE')}</th>
              <th>{t('ABSENCES.COL.TYPE')}</th>
              <th>{t('ABSENCES.COL.START')}</th>
              <th>{t('ABSENCES.COL.END')}</th>
              <th>{t('ABSENCES.COL.DAYS')}</th>
            </tr>
          </thead>
          <tbody>
            {groups.flatMap(group =>
              group.absences.map(a => (
                <tr key={a.id}>
                  <td>{group.name}</td>
                  <td>{a.type}</td>
                  <td>{fmtDate(a.startD)}</td>
                  <td>{fmtDate(a.endD)}</td>
                  <td>{daysBetween(a.startD, a.endD) + 1}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </details>
    </div>
  );
}
