import type { Metadata } from 'next';
import { EMBED_SESSION } from '@vigilant-broccoli/common-js';
import { PAGE_TITLE } from '../app.const';
import { EmbeddedTasks } from '../components/EmbeddedTasks';

export const metadata: Metadata = { title: PAGE_TITLE.EMBED };

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <EmbeddedTasks
      parentSession={params[EMBED_SESSION.PARAM] === EMBED_SESSION.PARENT}
    />
  );
}
