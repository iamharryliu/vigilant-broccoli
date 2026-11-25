import type { Metadata } from 'next';
import { EMBED_SESSION } from '@vigilant-broccoli/common-js';
import { PAGE_TITLE } from '../../app.const';
import { EmbeddedKanban } from '../../components/EmbeddedKanban';

export const metadata: Metadata = { title: PAGE_TITLE.EMBED_BOARD };

export default async function EmbedBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <EmbeddedKanban
      parentSession={params[EMBED_SESSION.PARAM] === EMBED_SESSION.PARENT}
    />
  );
}
