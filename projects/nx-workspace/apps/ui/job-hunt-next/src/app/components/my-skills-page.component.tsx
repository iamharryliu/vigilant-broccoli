'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Badge, Button, Card, Progress } from '@vigilant-broccoli/react-lib';
import { useSkillMatches } from '../hooks/use-skill-matches';
import { useTranslation } from '../i18n';
import { buildSkillCoverage } from '../utils/skill-coverage.utils';
import { SECTION_HEADING_CLASS } from './application-brief.component';
import {
  SKILL_BADGE_BUTTON_CLASS,
  SkillPostingsDialog,
  type SkillPostings,
} from './skill-postings-dialog.component';

const TOP_GAP_COUNT = 3;
const PERCENT = 100;

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-2xl font-semibold tabular-nums">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export const MySkillsPage = () => {
  const { t } = useTranslation();
  const { matches, ownedSkills, loadFailed } = useSkillMatches();
  const [gapsOnly, setGapsOnly] = useState(false);
  const [selection, setSelection] = useState<SkillPostings | null>(null);

  const coverage = useMemo(
    () => buildSkillCoverage(matches, ownedSkills),
    [matches, ownedSkills],
  );
  const allSkills = coverage.flatMap(group => group.skills);
  const ownedCount = allSkills.filter(skill => skill.owned).length;
  const gaps = allSkills
    .filter(skill => !skill.owned && skill.postings > 0)
    .sort((a, b) => b.postings - a.postings);

  const showPostings = (skill: string) =>
    setSelection({
      skill,
      matches: matches.filter(
        match => match.matched.includes(skill) || match.gaps.includes(skill),
      ),
    });

  const visibleGroups = coverage
    .map(group => ({
      ...group,
      total: group.skills.length,
      skills: gapsOnly
        ? group.skills.filter(skill => !skill.owned)
        : group.skills,
    }))
    .filter(group => group.skills.length > 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
      {loadFailed && (
        <p className="text-sm text-destructive">{t('MATCHES.LOAD_FAILED')}</p>
      )}
      <Card className="flex shrink-0 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <Stat
            label={t('MY_SKILLS.OWNED')}
            value={`${ownedCount} / ${allSkills.length}`}
          />
          <Stat label={t('MY_SKILLS.GAPS')} value={String(gaps.length)} />
          <Stat
            label={t('MY_SKILLS.POSTINGS')}
            value={String(matches.length)}
          />
        </div>
        {gaps.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className={SECTION_HEADING_CLASS}>
              {t('MY_SKILLS.TOP_GAPS')}
            </span>
            {gaps.slice(0, TOP_GAP_COUNT).map(skill => (
              <Badge key={skill.name} color="orange" variant="outline" size="1">
                <button
                  type="button"
                  onClick={() => showPostings(skill.name)}
                  className={SKILL_BADGE_BUTTON_CLASS}
                >
                  {skill.name} × {skill.postings}
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Button
          variant={gapsOnly ? 'default' : 'outline'}
          className="self-start"
          aria-pressed={gapsOnly}
          onClick={() => setGapsOnly(!gapsOnly)}
        >
          {t('MY_SKILLS.GAPS_ONLY')}
        </Button>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleGroups.map(({ group, skills, total, ownedCount: owned }) => (
          <Card key={group} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className={SECTION_HEADING_CLASS}>{group}</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {t('MY_SKILLS.GROUP_OWNED', {
                  owned: String(owned),
                  total: String(total),
                })}
              </span>
            </div>
            <Progress value={(owned / total) * PERCENT} aria-label={group} />
            <div className="flex flex-wrap gap-1">
              {skills.map(skill => (
                <Badge
                  key={skill.name}
                  color={skill.owned ? 'green' : 'orange'}
                  variant={skill.owned ? 'soft' : 'outline'}
                  size="1"
                >
                  {skill.owned && <Check className="size-3" />}
                  <button
                    type="button"
                    disabled={skill.postings === 0}
                    onClick={() => showPostings(skill.name)}
                    className={
                      skill.postings > 0 ? SKILL_BADGE_BUTTON_CLASS : undefined
                    }
                  >
                    {skill.name}
                    {skill.postings > 0 && ` × ${skill.postings}`}
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <SkillPostingsDialog
        selection={selection}
        onClose={() => setSelection(null)}
      />
    </div>
  );
};
