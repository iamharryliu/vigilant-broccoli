import { useState } from 'react';
import {
  EntryDirectory,
  type EntryDirectoryGroup,
} from '@vigilant-broccoli/entry-directory';

const SAMPLE_GROUPS = [
  {
    name: 'Dev',
    entries: [
      { label: 'GitHub', value: 'https://github.com' },
      { label: 'Vercel', value: 'https://vercel.com' },
      { label: 'Cloudflare', value: 'https://dash.cloudflare.com' },
    ],
  },
  {
    name: 'Leisure',
    entries: [
      { label: 'YouTube', value: 'https://www.youtube.com' },
      { label: 'Spotify', value: 'https://open.spotify.com' },
    ],
  },
];

export function EntryDirectoryDemo() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = (label: string) =>
    setFavorites(current =>
      current.includes(label)
        ? current.filter(item => item !== label)
        : [...current, label],
    );
  const entries = SAMPLE_GROUPS.flatMap(group => group.entries).map(entry => ({
    ...entry,
    isFavorite: favorites.includes(entry.label),
    onFavoriteToggle: () => toggleFavorite(entry.label),
  }));
  const groups: EntryDirectoryGroup[] = [
    ...(favorites.length
      ? [
          {
            name: 'Favorites',
            isFavorites: true,
            entries: entries.filter(entry => entry.isFavorite),
          },
        ]
      : []),
    ...SAMPLE_GROUPS.map(group => ({
      name: group.name,
      entries: entries.filter(entry =>
        group.entries.some(item => item.label === entry.label),
      ),
    })),
  ];
  return (
    <div className="flex h-96 max-w-xl flex-col">
      <EntryDirectory groups={groups} />
    </div>
  );
}
