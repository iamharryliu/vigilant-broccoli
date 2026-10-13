import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LinkCard } from '@vigilant-broccoli/react-lib';

interface CardLinkProps {
  href: string;
  title: string;
  description: string;
  route?: boolean;
  icon?: ReactNode;
}

export function CardLink({
  href,
  title,
  description,
  route,
  icon,
}: CardLinkProps) {
  if (route) {
    return (
      <LinkCard
        as={Link}
        to={href}
        title={title}
        description={description}
        icon={icon}
      />
    );
  }

  return (
    <LinkCard
      href={href}
      external
      title={title}
      description={description}
      icon={icon}
    />
  );
}
