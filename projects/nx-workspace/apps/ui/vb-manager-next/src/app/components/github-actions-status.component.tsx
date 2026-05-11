'use client';

import { GithubActionsBadges } from '@vigilant-broccoli/react-lib';
import { Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
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
          headerAction={
            <Link href={`${repoUrl}/actions`} target="_blank">
              <Text size="2" className="text-blue-600 hover:text-blue-800">
                View All →
              </Text>
            </Link>
          }
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
