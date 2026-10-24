'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Table,
  Button,
  Callout,
  CalloutText,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  Heading,
  IconButton,
  Select,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { EllipsisCTA } from '@vigilant-broccoli/react-lib-higher-level';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  MAX_TODO_REMOVAL_REASON_LENGTH,
  TODO_SORT_RANKS,
  TODO_STATUS_LEGEND,
  TODO_TYPE_ORDER,
  type TodoStatusField,
} from '../constants/todo';
import { authFetch } from '../../../libs/auth';
import type { TodoRow } from '../api/todo/_lib/todo-markdown.utils';

const STATUS_SEPARATOR = ' · ';
const STATUS_LEGEND_TITLE = 'Status legend';
const STATUS_LEGEND_INTRO =
  'Each row shows Priority · Effort · Agent. Sort by any of them with the selector above the tables.';
const SORT_LABEL = 'Sort by';
const DEFAULT_SORT_FIELD: TodoStatusField = 'Priority';
const SORT_OPTIONS: TodoStatusField[] = TODO_STATUS_LEGEND.map(
  ({ field }) => field,
);
const SORT_FIELD_KEY = {
  Priority: 'priority',
  Effort: 'effort',
  Agent: 'agent',
} as const satisfies Record<TodoStatusField, keyof TodoRow>;
const BRIEF_TITLE = 'Brief';
const DESCRIPTION_TITLE = 'Description';
const RECOMMENDED_FIX_TITLE = 'Recommended Fix';
const CLOSE_BUTTON_LABEL = 'Close';
const CELL_LINE_BREAK_RE = /<br\s*\/?>/g;
const ESCAPED_PIPE_RE = /\\\|/g;
const FETCH_ERROR = 'Failed to load TODO.md';
const RUN_ERROR = 'Failed to trigger agentic solve workflow';
const RUN_TITLE = 'Run agentic solve';
const RUN_DISPATCHED = (id: string) => `Agentic solve dispatched for ${id}`;
const REMOVE_TITLE = 'Delete';
const REMOVE_DIALOG_TITLE = (id: string) => `Remove TODO ${id}`;
const REMOVE_REASON_PLACEHOLDER =
  'Why is this TODO being removed? (resolved elsewhere, no longer relevant, accepted risk…)';
const REMOVE_SUBMIT_LABEL = 'Open removal PR';
const REMOVE_SUBMITTING_LABEL = 'Dispatching…';
const CANCEL_BUTTON_LABEL = 'Cancel';
const REMOVE_ERROR = 'Failed to dispatch the TODO removal workflow';
const REMOVE_DISPATCHED = (id: string) =>
  `Removal PR dispatched for ${id}; the row disappears once it merges.`;
const LOADING_MESSAGE = 'Loading TODO.md…';
const CELL_TEXT_CLASS = 'text-xs';
const TABLE_OF_CONTENTS_TITLE = 'Table of Contents';
const NON_SLUG_CHARS_RE = /[^a-z0-9]+/g;
const EDGE_DASHES_RE = /^-+|-+$/g;

// TODO.md cells hold one physical line, so steps are joined with <br> and
// pipes are escaped; restore both so the Markdown renders lists and pipes.
const cellToMarkdown = (cell: string) =>
  cell.replace(CELL_LINE_BREAK_RE, '\n').replace(ESCAPED_PIPE_RE, '|');

const formatStatus = (row: TodoRow) =>
  [row.priority, row.effort, row.agent].join(STATUS_SEPARATOR);

const TodoDetailSection = ({
  title,
  cell,
}: {
  title: string;
  cell: string;
}) => (
  <div className="flex flex-col gap-1">
    <Heading size="2">{title}</Heading>
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown>{cellToMarkdown(cell)}</ReactMarkdown>
    </div>
  </div>
);

const TodoDetailsDialog = ({ row }: { row: TodoRow }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        type="button"
        className={`block w-full min-w-[16rem] whitespace-pre-wrap text-left cursor-pointer ${CELL_TEXT_CLASS}`}
      >
        {row.brief}
      </button>
    </DialogTrigger>
    <DialogContent
      className="block w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
      aria-describedby={undefined}
      showCloseButton={false}
      style={{ maxWidth: '720px' }}
    >
      <DialogTitle className="mb-1 text-xl font-bold leading-7 tracking-normal">
        <span className="font-mono">{row.id}</span>
      </DialogTitle>
      <Text size="2" color="gray">
        {formatStatus(row)}
      </Text>
      <div className="flex flex-col gap-4 mt-4">
        <TodoDetailSection title={BRIEF_TITLE} cell={row.brief} />
        <TodoDetailSection title={DESCRIPTION_TITLE} cell={row.description} />
        <TodoDetailSection
          title={RECOMMENDED_FIX_TITLE}
          cell={row.recommendedFix}
        />
      </div>
      <div className="flex justify-end mt-4">
        <DialogClose asChild>
          <Button size="sm" variant="secondary">
            {CLOSE_BUTTON_LABEL}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);

const RemoveTodoDialog = ({
  row,
  onClose,
  onDispatched,
}: {
  row: TodoRow | null;
  onClose: () => void;
  onDispatched: (id: string) => void;
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmedReason = reason.trim();

  const close = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!row || !trimmedReason) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await authFetch(API_ENDPOINTS.TODO_REMOVE, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ id: row.id, reason: trimmedReason }),
      });
      if (!response.ok) throw new Error(REMOVE_ERROR);
      onDispatched(row.id);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : REMOVE_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={row !== null} onOpenChange={open => !open && close()}>
      <DialogContent
        className="block w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
        aria-describedby={undefined}
        showCloseButton={false}
        style={{ maxWidth: '520px' }}
      >
        {row && (
          <>
            <DialogTitle className="mb-1 text-xl font-bold leading-7 tracking-normal">
              {REMOVE_DIALOG_TITLE(row.id)}
            </DialogTitle>
            <Text size="2" color="gray">
              {row.brief}
            </Text>
            <Textarea
              className={`mt-4 min-h-[96px] w-full ${CELL_TEXT_CLASS}`}
              placeholder={REMOVE_REASON_PLACEHOLDER}
              value={reason}
              maxLength={MAX_TODO_REMOVAL_REASON_LENGTH}
              onChange={event => setReason(event.target.value)}
              autoFocus
            />
            {error && (
              <Text size="2" color="red" className="mt-2 block">
                {error}
              </Text>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button size="sm" variant="secondary">
                  {CANCEL_BUTTON_LABEL}
                </Button>
              </DialogClose>
              <Button
                size="sm"
                color="red"
                onClick={submit}
                disabled={!trimmedReason || submitting}
              >
                {submitting ? REMOVE_SUBMITTING_LABEL : REMOVE_SUBMIT_LABEL}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const slugify = (heading: string) =>
  heading
    .toLowerCase()
    .trim()
    .replace(NON_SLUG_CHARS_RE, '-')
    .replace(EDGE_DASHES_RE, '');

const rankOf = (field: TodoStatusField, value: string) => {
  const rank = TODO_SORT_RANKS[field].indexOf(value);
  return rank === -1 ? TODO_SORT_RANKS[field].length : rank;
};

const fieldValue = (row: TodoRow, field: TodoStatusField) =>
  row[SORT_FIELD_KEY[field]];

// Array.prototype.sort is stable, so equal rows keep their TODO.md order.
const sortRows = (rows: TodoRow[], field: TodoStatusField) =>
  [...rows].sort(
    (a, b) =>
      rankOf(field, fieldValue(a, field)) -
        rankOf(field, fieldValue(b, field)) ||
      rankOf(DEFAULT_SORT_FIELD, a.priority) -
        rankOf(DEFAULT_SORT_FIELD, b.priority),
  );

const typeRank = (type: string) => {
  const rank = TODO_TYPE_ORDER.indexOf(type);
  return rank === -1 ? TODO_TYPE_ORDER.length : rank;
};

const groupByType = (rows: TodoRow[], field: TodoStatusField) =>
  [...new Set(rows.map(row => row.type))]
    .sort((a, b) => typeRank(a) - typeRank(b) || a.localeCompare(b))
    .map(type => ({
      type,
      rows: sortRows(
        rows.filter(row => row.type === type),
        field,
      ),
    }));

const StatusLegendDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <IconButton
        icon="help"
        variant="ghost"
        iconSize={14}
        aria-label={STATUS_LEGEND_TITLE}
      />
    </DialogTrigger>
    <DialogContent
      className="block w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
      aria-describedby={undefined}
      showCloseButton={false}
      style={{ maxWidth: '560px' }}
    >
      <DialogTitle className="mb-1 text-xl font-bold leading-7 tracking-normal">
        {STATUS_LEGEND_TITLE}
      </DialogTitle>
      <Text size="2" color="gray">
        {STATUS_LEGEND_INTRO}
      </Text>
      <div className="flex flex-col gap-4 mt-4">
        {TODO_STATUS_LEGEND.map(({ field, values }) => (
          <div key={field} className="flex flex-col gap-1">
            <Heading size="2">{field}</Heading>
            <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1">
              {values.map(({ value, meaning }) => (
                <Fragment key={value}>
                  <dt className={`font-mono ${CELL_TEXT_CLASS}`}>{value}</dt>
                  <dd className={CELL_TEXT_CLASS}>{meaning}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <DialogClose asChild>
          <Button size="sm" variant="secondary">
            {CLOSE_BUTTON_LABEL}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);

export const TodoListComponent = () => {
  const [rows, setRows] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [removalTarget, setRemovalTarget] = useState<TodoRow | null>(null);
  const [sortField, setSortField] =
    useState<TodoStatusField>(DEFAULT_SORT_FIELD);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const groups = useMemo(() => groupByType(rows, sortField), [rows, sortField]);

  const scrollToSection = (type: string) =>
    sectionRefs.current[type]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await authFetch(API_ENDPOINTS.TODO);
        if (!response.ok) throw new Error(FETCH_ERROR);
        const data = await response.json();
        setRows(data.rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, []);

  const runTodo = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      const response = await authFetch(API_ENDPOINTS.TODO_SOLVE, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error(RUN_ERROR);
      setNotice(RUN_DISPATCHED(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : RUN_ERROR);
    }
  };

  if (loading) return <Text size="2">{LOADING_MESSAGE}</Text>;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <Callout color="red">
          <CalloutText>{error}</CalloutText>
        </Callout>
      )}
      {notice && (
        <Callout color="green">
          <CalloutText>{notice}</CalloutText>
        </Callout>
      )}
      <RemoveTodoDialog
        row={removalTarget}
        onClose={() => setRemovalTarget(null)}
        onDispatched={id => {
          setError(null);
          setNotice(REMOVE_DISPATCHED(id));
        }}
      />
      {groups.length > 0 && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Heading size="3">{TABLE_OF_CONTENTS_TITLE}</Heading>
            <ul className="list-disc pl-5">
              {groups.map(({ type, rows: typeRows }) => (
                <li key={type}>
                  <a
                    href={`#${slugify(type)}`}
                    onClick={event => {
                      event.preventDefault();
                      scrollToSection(type);
                    }}
                    className="text-sm text-primary underline underline-offset-4"
                  >
                    {type}
                  </a>{' '}
                  <Text size="1" color="gray">
                    ({typeRows.length})
                  </Text>
                </li>
              ))}
            </ul>
          </div>
          <label className="flex items-center gap-2">
            <Text size="2">{SORT_LABEL}</Text>
            <Select
              value={sortField}
              onValueChange={value => setSortField(value as TodoStatusField)}
              options={SORT_OPTIONS}
              triggerClassName={`h-8 ${CELL_TEXT_CLASS}`}
            />
          </label>
        </div>
      )}
      {groups.map(({ type, rows: typeRows }) => (
        <div
          key={type}
          id={slugify(type)}
          ref={element => {
            sectionRefs.current[type] = element;
          }}
          className="flex flex-col gap-2"
        >
          <Heading size="3">{type}</Heading>
          <div className="overflow-x-auto">
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="w-24">
                    ID
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="w-40">
                    <span className="inline-flex items-center gap-1">
                      Status
                      <StatusLegendDialog />
                    </span>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Brief</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="w-10" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {typeRows.map(row => (
                  <Table.Row key={row.id}>
                    <Table.Cell>
                      <Text className={`font-mono ${CELL_TEXT_CLASS}`}>
                        {row.id}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className={`whitespace-nowrap ${CELL_TEXT_CLASS}`}>
                        {formatStatus(row)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <TodoDetailsDialog row={row} />
                    </Table.Cell>
                    <Table.Cell>
                      <EllipsisCTA
                        actions={[
                          { label: RUN_TITLE, onSelect: () => runTodo(row.id) },
                          {
                            label: REMOVE_TITLE,
                            color: 'red',
                            onSelect: () => setRemovalTarget(row),
                          },
                        ]}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      ))}
    </div>
  );
};
