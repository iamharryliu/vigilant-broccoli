import type { Metadata } from 'next';
import { PAGE_TITLE } from '../app.const';
import { EmbeddedTasks } from '../components/EmbeddedTasks';

export const metadata: Metadata = { title: PAGE_TITLE.EMBED };

export default function EmbedPage() {
  return <EmbeddedTasks />;
}
