'use client';

import {  Card, Heading } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const API_ROUTES = {
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
  USER_ORGANIZATIONS: '/api/github/user/organizations',
};

export const GithubTeamManager = () => {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const res = await fetch(`${API_ROUTES.USER_ORGANIZATIONS}`);
      const userOrganizations = await res.json();
      setOrganizations(userOrganizations);
    }
    init();
  }, []);

  return (
    <Card>
      <Heading>Github Organizations</Heading>
      {organizations.map(organization => {
        return (
          <Card
            key={organization}
            onClick={() => router.push(`github/organization/${organization}`)}
          >
            {organization}
          </Card>
        );
      })}
    </Card>
  );
};
