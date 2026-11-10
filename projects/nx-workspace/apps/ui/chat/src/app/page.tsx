import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ChatRoom } from './components/ChatRoom';
import { getAccessEmail } from '../lib/access-identity.server';

// The root layout's default title ("Room | Chat") names this page.
export default async function HomePage() {
  // The proxy already rejects unverified requests; this keeps the page from
  // rendering without an identity if the matcher ever stops covering it.
  const email = await getAccessEmail(await headers());
  if (!email) notFound();
  return <ChatRoom sender={email} />;
}
