import {
  SKILL_VOCABULARY,
  ownedSkillsOutsideVocabulary,
  ownsSkill,
  type JobMatch,
} from './job-matches.utils';
import { OTHER_SKILL_GROUP, groupOfSkill } from './skill-graph.utils';

export type CoverageSkill = {
  name: string;
  owned: boolean;
  // Captured postings that name the skill.
  postings: number;
};

export type CoverageGroup = {
  group: string;
  skills: CoverageSkill[];
  ownedCount: number;
  // Postings naming any of the group's skills, summed: the group's demand.
  demand: number;
};

const postingCounts = (matches: JobMatch[]) => {
  const counts = new Map<string, number>();
  matches.forEach(match =>
    new Set([...match.matched, ...match.gaps]).forEach(skill =>
      counts.set(skill, (counts.get(skill) ?? 0) + 1),
    ),
  );
  return counts;
};

// Every predefined skill by group with whether the career file covers it, plus
// the career-file skills no predefined term knows under "Other", so nothing
// the user owns is hidden. Groups are ordered by demand, skills within a
// group by postings.
export const buildSkillCoverage = (
  matches: JobMatch[],
  ownedSkills: string[],
): CoverageGroup[] => {
  const counts = postingCounts(matches);
  const byGroup = new Map<string, CoverageSkill[]>();
  const add = (group: string, skill: CoverageSkill) =>
    byGroup.set(group, [...(byGroup.get(group) ?? []), skill]);

  SKILL_VOCABULARY.forEach(term =>
    add(groupOfSkill(term.name), {
      name: term.name,
      owned: ownsSkill(term, ownedSkills),
      postings: counts.get(term.name) ?? 0,
    }),
  );
  ownedSkillsOutsideVocabulary(ownedSkills).forEach(name =>
    add(OTHER_SKILL_GROUP, {
      name,
      owned: true,
      postings: counts.get(name) ?? 0,
    }),
  );

  return [...byGroup]
    .map(([group, skills]) => ({
      group,
      skills: [...skills].sort(
        (a, b) => b.postings - a.postings || a.name.localeCompare(b.name),
      ),
      ownedCount: skills.filter(skill => skill.owned).length,
      demand: skills.reduce((sum, skill) => sum + skill.postings, 0),
    }))
    .sort((a, b) => b.demand - a.demand || a.group.localeCompare(b.group));
};
