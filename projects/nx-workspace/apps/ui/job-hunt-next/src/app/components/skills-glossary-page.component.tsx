'use client';

import { Table } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { SKILL_DESCRIPTIONS } from '../utils/skill-descriptions.utils';
import { SKILL_VOCABULARY } from '../utils/posting-match.utils';

const GLOSSARY = SKILL_VOCABULARY.map(term => ({
  name: term.name,
  description: SKILL_DESCRIPTIONS[term.name] ?? '',
})).sort((a, b) => a.name.localeCompare(b.name));

export const SkillsGlossaryPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="w-1/4">
              {t('SKILLS_GLOSSARY.SKILL')}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {t('SKILLS_GLOSSARY.DESCRIPTION')}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {GLOSSARY.map(({ name, description }) => (
            <Table.Row key={name}>
              <Table.RowHeaderCell>{name}</Table.RowHeaderCell>
              <Table.Cell className="text-muted-foreground">
                {description}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
