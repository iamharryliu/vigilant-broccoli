import { ReactNode } from 'react';
import {
  CardContainer,
  CardSkeleton,
  StatusCardList,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { StatusLegendButton, StatusLegendEntry } from './status-dot.component';

interface StatusListCardProps {
  title: string;
  loading: boolean;
  error: string | null;
  items: StatusCardListItem[];
  emptyMessage: string;
  skeletonRows?: number;
  legend?: StatusLegendEntry[];
  headerLink?: { href: string; label: string };
  headerAction?: ReactNode;
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  errorContent?: ReactNode;
  children?: ReactNode;
}

export const StatusListCard = ({
  title,
  loading,
  error,
  items,
  emptyMessage,
  skeletonRows = 3,
  legend,
  headerLink,
  headerAction,
  gap,
  errorContent,
  children,
}: StatusListCardProps) => {
  if (loading) return <CardSkeleton title={title} rows={skeletonRows} />;

  if (error) {
    return (
      <CardContainer
        title={title}
        gap={gap}
        headerLink={headerLink}
        headerAction={headerAction}
      >
        {errorContent ?? <Text color="red">{error}</Text>}
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title={title}
      gap={gap}
      headerLink={headerLink}
      headerAction={headerAction}
      titleAction={legend && <StatusLegendButton entries={legend} />}
    >
      <StatusCardList items={items} emptyMessage={emptyMessage} />
      {children}
    </CardContainer>
  );
};
