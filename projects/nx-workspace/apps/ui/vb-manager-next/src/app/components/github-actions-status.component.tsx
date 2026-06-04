'use client';

import {
  CardContainer,
  GithubActionsBadges,
} from '@vigilant-broccoli/react-lib';

import { useState } from 'react';
import { CardSkeleton } from './skeleton.component';

export const GithubRepoActionStatusBadges = ({
  repoUrl,
}: {
  repoUrl: string;
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <CardSkeleton title="GitHub Actions" rows={4} />}
      <div style={{ display: loading ? 'none' : undefined }}>
        <CardContainer
          title="GitHub Actions"
          headerLink={{ href: `${repoUrl}/actions`, label: 'View All' }}
        >
          <div className="flex flex-col gap-2">
            <GithubActionsBadges
              repoUrl={repoUrl}
              onLoadingChange={setLoading}
            />
          </div>
        </CardContainer>
      </div>
    </>
  );
};
