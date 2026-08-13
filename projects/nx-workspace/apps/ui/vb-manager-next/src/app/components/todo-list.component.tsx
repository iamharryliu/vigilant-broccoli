'use client';

import { useEffect, useState } from 'react';
import { Callout, Flex, Table } from '@radix-ui/themes';
import {
  Button,
  DeleteIconButton,
  IconButton,
  Select,
  Textarea,
  Heading,
  Text,
} from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';

interface TodoRow {
  id: string;
  priority: string;
  description: string;
  recommendedFix: string;
}

interface TodoSection {
  heading: string;
  rows: TodoRow[];
}

const PRIORITY_OPTIONS = ['P1', 'P2', 'P3', 'NA'];
const NEW_ROW_DEFAULTS = {
  priority: 'NA',
  description: '',
  recommendedFix: '',
};
const FETCH_ERROR = 'Failed to load TODO.md';
const SAVE_ERROR = 'Failed to save TODO.md';
const SAVE_SUCCESS = 'Saved to TODO.md';
const LOADING_MESSAGE = 'Loading TODO.md…';
const CELL_TEXT_CLASS = 'text-xs';

const generateRowId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 6);

type EditableField = 'description' | 'recommendedFix';

const editingCellKey = (
  heading: string,
  rowIdx: number,
  field: EditableField,
) => `${heading}-${rowIdx}-${field}`;

export const TodoListComponent = () => {
  const [sections, setSections] = useState<TodoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await authFetch(API_ENDPOINTS.TODO);
        if (!response.ok) throw new Error(FETCH_ERROR);
        const data = await response.json();
        setSections(data.sections);
      } catch (err) {
        setError(err instanceof Error ? err.message : FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, []);

  const updateSection = (
    heading: string,
    updateRows: (rows: TodoRow[]) => TodoRow[],
  ) => {
    setSaved(false);
    setSections(current =>
      current.map(section =>
        section.heading === heading
          ? { ...section, rows: updateRows(section.rows) }
          : section,
      ),
    );
  };

  const updateRow = (
    heading: string,
    rowIdx: number,
    patch: Partial<TodoRow>,
  ) =>
    updateSection(heading, rows =>
      rows.map((row, idx) => (idx === rowIdx ? { ...row, ...patch } : row)),
    );

  const addRow = (heading: string) =>
    updateSection(heading, rows => [
      ...rows,
      { id: generateRowId(), ...NEW_ROW_DEFAULTS },
    ]);

  const deleteRow = (heading: string, rowIdx: number) =>
    updateSection(heading, rows => rows.filter((_, idx) => idx !== rowIdx));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await authFetch(API_ENDPOINTS.TODO, {
        method: HTTP_METHOD.PUT,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ sections }),
      });
      if (!response.ok) throw new Error(SAVE_ERROR);
      const data = await response.json();
      setSections(data.sections);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Text size="2">{LOADING_MESSAGE}</Text>;

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="4">TODO.md</Heading>
        <Flex align="center" gap="3">
          {saved && !error && (
            <Text size="1" color="gray">
              {SAVE_SUCCESS}
            </Text>
          )}
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </Flex>
      </Flex>
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {sections.map(section => (
        <Flex key={section.heading} direction="column" gap="2">
          <Heading size="3">{section.heading}</Heading>
          <div className="overflow-x-auto">
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="w-24">
                    ID
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="w-24">
                    Priority
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    Recommended Fix
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="w-10" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {section.rows.map((row, rowIdx) => (
                  <Table.Row key={rowIdx}>
                    <Table.Cell>
                      <Text className={`font-mono ${CELL_TEXT_CLASS}`}>
                        {row.id}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Select
                        selectedOption={row.priority}
                        setValue={priority =>
                          updateRow(section.heading, rowIdx, { priority })
                        }
                        options={PRIORITY_OPTIONS}
                        triggerClassName={`h-8 ${CELL_TEXT_CLASS}`}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {editingCell ===
                      editingCellKey(section.heading, rowIdx, 'description') ? (
                        <Textarea
                          className={`min-h-[64px] w-full min-w-[16rem] ${CELL_TEXT_CLASS}`}
                          value={row.description}
                          onChange={event =>
                            updateRow(section.heading, rowIdx, {
                              description: event.target.value,
                            })
                          }
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        <Text
                          className={`block min-h-[64px] w-full min-w-[16rem] whitespace-pre-wrap cursor-text ${CELL_TEXT_CLASS}`}
                          onClick={() =>
                            setEditingCell(
                              editingCellKey(
                                section.heading,
                                rowIdx,
                                'description',
                              ),
                            )
                          }
                        >
                          {row.description}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {editingCell ===
                      editingCellKey(
                        section.heading,
                        rowIdx,
                        'recommendedFix',
                      ) ? (
                        <Textarea
                          className={`min-h-[64px] w-full min-w-[16rem] ${CELL_TEXT_CLASS}`}
                          value={row.recommendedFix}
                          onChange={event =>
                            updateRow(section.heading, rowIdx, {
                              recommendedFix: event.target.value,
                            })
                          }
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        <Text
                          className={`block min-h-[64px] w-full min-w-[16rem] whitespace-pre-wrap cursor-text ${CELL_TEXT_CLASS}`}
                          onClick={() =>
                            setEditingCell(
                              editingCellKey(
                                section.heading,
                                rowIdx,
                                'recommendedFix',
                              ),
                            )
                          }
                        >
                          {row.recommendedFix}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <DeleteIconButton
                        onClick={() => deleteRow(section.heading, rowIdx)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
          <IconButton
            icon="plus"
            variant="ghost"
            className="w-min"
            onClick={() => addRow(section.heading)}
          />
        </Flex>
      ))}
    </Flex>
  );
};
