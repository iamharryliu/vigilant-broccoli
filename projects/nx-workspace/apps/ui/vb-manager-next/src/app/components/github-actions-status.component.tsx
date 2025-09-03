'use client';

import { Card, Heading } from '@radix-ui/themes';
import Link from 'next/link';

type Badge = {
  alt: string;
  href: string;
  src: string;
};

const BADGES: Badge[] = [
  {
    alt: 'App Health Check Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-health-check.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-health-check.yml/badge.svg',
  },
  {
    alt: 'CMS Flask - Deploy App',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-cms-flask.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-cms-flask.yml/badge.svg',
  },
  {
    alt: 'Deploy Nx Apps - Deploy Apps Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml/badge.svg',
  },
  {
    alt: 'Toronto Alerts Flask - Deploy App Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts.yml/badge.svg',
  },
];

export const StatusBadges = () => {
  return (
    <Card>
      <Heading>Github Actions</Heading>
      <Link
        href="https://github.com/iamharryliu/vigilant-broccoli/actions"
        target="_blank"
      >
        Go To Actions
      </Link>
      <div className="flex flex-wrap gap-2">
        {BADGES.map(badge => (
          <div key={badge.alt}>
            <a href={badge.href} target="_blank" rel="noopener noreferrer">
              <img src={badge.src} alt={badge.alt} />
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
};
