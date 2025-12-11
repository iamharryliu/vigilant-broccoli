'use client';

import { Card, Flex, Text } from '@radix-ui/themes';
import { LINK_TYPE } from '../(pages)/page';

type LinkType = typeof LINK_TYPE[keyof typeof LINK_TYPE];

interface LinkItem {
  label: string;
  target: string;
  type: LinkType;
}

interface LinkGroupProps {
  title: string;
  links: LinkItem[];
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

export function LinkGroupComponent({ title, links }: LinkGroupProps) {
  const sortedLinks = [...links].sort((a, b) => a.label.localeCompare(b.label));

  const handleOpenMacApp = async (target: string) => {
    try {
      const response = await fetch('/api/shell/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appName: target }),
      });

      if (!response.ok) {
        console.error('Failed to open Mac application');
      }
    } catch (error) {
      console.error('Error opening Mac application:', error);
    }
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        <Text size="5" weight="bold">{title}</Text>
        <div className="flex flex-wrap gap-2">
        {sortedLinks.map((link, index) => {
          const colorClass = COLOR_PALETTE[index % COLOR_PALETTE.length];
          const baseClass = `inline-flex justify-center px-4 py-1.5 ${colorClass} text-white rounded-full text-sm font-medium w-fit transition-colors`;

          if (link.type === LINK_TYPE.MAC_APPLICATION) {
            return (
              <button
                key={link.target}
                onClick={() => handleOpenMacApp(link.target)}
                className={`${baseClass} cursor-pointer`}
              >
                {link.label}
              </button>
            );
          }

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
        })}
        </div>
      </Flex>
    </Card>
  );
}
