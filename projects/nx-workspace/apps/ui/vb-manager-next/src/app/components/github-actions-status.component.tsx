'use client';

import { GithubActionsBadges } from '@vigilant-broccoli/react-lib';
import { Flex } from '@radix-ui/themes';
import { useState } from 'react';
import { CardContainer } from './card-container.component';
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
          <Flex direction="column" gap="2">
            <GithubActionsBadges
              repoUrl={repoUrl}
              onLoadingChange={setLoading}
            />
          </Flex>
        </CardContainer>
      </div>
    </>
  );
};
