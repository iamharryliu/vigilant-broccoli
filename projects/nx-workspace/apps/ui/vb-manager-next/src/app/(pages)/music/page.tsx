'use client';

import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import { DjMusicUtilityContent } from '../../components/utilities/dj-music.utility';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const MUSIC_ITEMS: CollapsibleListItemConfig[] = [
  {
    id: 'metronome',
    title: 'Metronome',
    content: <Metronome />,
  },
  {
    id: 'dj-music',
    title: 'DJ Music',
    content: <DjMusicUtilityContent />,
  },
];

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.MUSIC.title);
  return (
    <div className="h-full overflow-auto">
      <CollapsibleList items={MUSIC_ITEMS} storageKeyPrefix="music" />
    </div>
  );
}
