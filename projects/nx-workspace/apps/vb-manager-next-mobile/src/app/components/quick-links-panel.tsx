'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { QuickLink } from '@vigilant-broccoli/links';
import { QUICK_LINKS } from '../constants/quick-links';

const PANEL_TITLE = 'Quick Links';
const SEARCH_PLACEHOLDER = 'Search links…';
const EMPTY_MESSAGE = 'No links found.';

const matchesQuery = (link: QuickLink, query: string) =>
  link.label.toLowerCase().includes(query) ||
  link.subgroup.toLowerCase().includes(query);

const groupBySubgroup = (links: QuickLink[]) => {
  const groups = new Map<string, QuickLink[]>();
  links.forEach(link => {
    const group = groups.get(link.subgroup);
    if (group) group.push(link);
    else groups.set(link.subgroup, [link]);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subgroup, subgroupLinks]) => ({
      subgroup,
      links: [...subgroupLinks].sort((a, b) => a.label.localeCompare(b.label)),
    }));
};

export const QuickLinksPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groupBySubgroup(
      normalized
        ? QUICK_LINKS.filter(link => matchesQuery(link, normalized))
        : QUICK_LINKS,
    );
  }, [query]);

  return (
    <section className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800"
      >
        {PANEL_TITLE}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="flex max-h-[45dvh] flex-col gap-3 overflow-y-auto border-t border-gray-100 px-4 py-3">
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          />

          {groups.length === 0 && (
            <p className="text-sm text-gray-500">{EMPTY_MESSAGE}</p>
          )}

          {groups.map(group => (
            <div key={group.subgroup}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {group.subgroup}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.links.map(link => (
                  <a
                    key={`${group.subgroup}-${link.label}`}
                    href={link.target}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
