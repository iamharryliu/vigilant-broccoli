import { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { CardLink } from './CardLink';
import { CardGrid } from './CardGrid';

export interface CardListItem {
  key: string;
  href: string;
  route?: boolean;
  title: string;
  description: string;
  icon?: ReactNode;
}

interface CardListPageProps {
  title: string;
  items: CardListItem[];
}

export function CardListPage({ title, items }: CardListPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader title={title} />
      <CardGrid>
        {items.map(item => (
          <li key={item.key}>
            <CardLink
              route={item.route}
              href={item.href}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          </li>
        ))}
      </CardGrid>
    </main>
  );
}
