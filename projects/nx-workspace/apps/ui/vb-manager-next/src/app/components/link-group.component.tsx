'use client';

import { Card, Flex, Text } from '@radix-ui/themes';
import { LINK_TYPE } from '../constants/link-types';
import { API_ENDPOINTS } from '../constants/api-endpoints';

type LinkType = (typeof LINK_TYPE)[keyof typeof LINK_TYPE];

interface LinkItem {
  label: string;
  target: string;
  type: LinkType;
  subgroup?: string;
}

interface LinkGroupProps {
  title: string;
  links: LinkItem[];
  alphabetical?: boolean;
  alphabeticalSubgroups?: boolean;
}

const COLOR_PALETTE = [
  'bg-blue-600 hover:bg-blue-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-green-600 hover:bg-green-700',
  'bg-red-600 hover:bg-red-700',
  'bg-orange-600 hover:bg-orange-700',
  'bg-pink-600 hover:bg-pink-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-teal-600 hover:bg-teal-700',
  'bg-cyan-600 hover:bg-cyan-700',
  'bg-emerald-600 hover:bg-emerald-700',
  'bg-violet-600 hover:bg-violet-700',
  'bg-rose-600 hover:bg-rose-700',
];

export function LinkGroupComponent({
  title,
  links,
  alphabetical = true,
  alphabeticalSubgroups = true,
}: LinkGroupProps) {
  const subgroupOrder: string[] = [];
  links.forEach(link => {
    if (link.subgroup && !subgroupOrder.includes(link.subgroup)) {
      subgroupOrder.push(link.subgroup);
    }
  });

  const sortedLinks = alphabetical
    ? [...links].sort((a, b) => a.label.localeCompare(b.label))
    : links;

  const itemsWithoutSubgroup = sortedLinks.filter(link => !link.subgroup);
  const itemsWithSubgroup = sortedLinks.filter(link => link.subgroup);

  const subgroups = itemsWithSubgroup.reduce((acc, link) => {
    const group = link.subgroup!;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const subgroupEntries = alphabeticalSubgroups
    ? Object.entries(subgroups).sort(([a], [b]) => a.localeCompare(b))
    : subgroupOrder.map(key => [key, subgroups[key]] as [string, LinkItem[]]);

  const handleShellExecute = async (type: LinkType, target: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.SHELL_EXECUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, target }),
      });

      if (!response.ok) {
        console.error('Failed to execute shell command');
      }
    } catch (error) {
      console.error('Error executing shell command:', error);
    }
  };

  const renderLink = (link: LinkItem, index: number) => {
    const colorClass = COLOR_PALETTE[index % COLOR_PALETTE.length];
    const baseClass = `inline-flex justify-center px-4 py-1.5 ${colorClass} text-white rounded-full text-xs font-medium w-fit transition-colors`;

    if (
      link.type === LINK_TYPE.MAC_APPLICATION ||
      link.type === LINK_TYPE.VSCODE ||
      link.type === LINK_TYPE.FILE_SYSTEM
    ) {
      return (
        <button
          key={link.target}
          onClick={() => handleShellExecute(link.type, link.target)}
          className={`${baseClass} cursor-pointer`}
        >
          {link.label}
        </button>
      );
    }

    // Browser links
    return (
      <a
        key={link.target}
        href={link.target}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        {link.label}
      </a>
    );
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        <Text size="5" weight="bold">
          {title}
        </Text>

        {itemsWithoutSubgroup.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {itemsWithoutSubgroup.map((link, index) => renderLink(link, index))}
          </div>
        )}

        {subgroupEntries.map(([subgroupName, subgroupLinks]) => (
          <div key={subgroupName}>
            <Text size="3" weight="medium" className="mb-2">
              {subgroupName}
            </Text>
            <div className="flex flex-wrap gap-2">
              {subgroupLinks.map((link, index) => renderLink(link, index))}
            </div>
          </div>
        ))}
      </Flex>
    </Card>
  );
}
