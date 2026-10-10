'use client';

import { CardContainer } from '@vigilant-broccoli/react-lib';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import { DjMusicUtilityContent } from '../../components/utilities/dj-music.utility';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const DJ_MUSIC_TITLE = 'DJ Music';
const METRONOME_TITLE = 'Metronome';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.MUSIC.title);
  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardContainer title={DJ_MUSIC_TITLE}>
          <DjMusicUtilityContent />
        </CardContainer>
        <CardContainer title={METRONOME_TITLE}>
          <Metronome />
        </CardContainer>
      </div>
    </div>
  );
}
