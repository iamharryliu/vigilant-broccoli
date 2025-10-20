'use client';
import { use, useEffect, useState } from 'react';
import { API_ROUTES } from '../../../../components/github-manager.component';
import {
  GithubOrganizationTeamStructure,
  GithubTeamMember,
} from '@vigilant-broccoli/common-js';
import { Card, Heading, Link } from '@radix-ui/themes';
import { CopyPastable } from '@vigilant-broccoli/react-lib';

export default function Page({
  params,
}: {
  params: Promise<{ organizationName: string }>;
}) {
  const { organizationName } = use(params);
  const [organizationStructure, setOrganizationStructure] =
    useState<GithubOrganizationTeamStructure>();

  useEffect(() => {
    async function init() {
      const res = await fetch(
        `${API_ROUTES.ORGANIZATION_STRUCTURE}?organization=${organizationName}`,
      );
      const structure = await res.json();
      setOrganizationStructure(structure);
    }
    init();
  }, [organizationName]);

  if (!organizationStructure) return 'loading...';
  return <Structure item={{ id: '1', config: organizationStructure }} />;
}

const GithubTeamLink = ({
  organization,
  team,
}: {
  organization: string;
  team: string;
}) => {
  return (
    <Link
      href={`https://github.com/orgs/${organization}/teams/${team}`}
      target="_blank"
    >
      {team}
    </Link>
  );
};

const GithubUserLink = ({ member }: { member: GithubTeamMember }) => {
  return (
    <Link href={`https://github.com/${member.username}`} target="_blank">
      {member.username} ({member.role})
    </Link>
  );
};

const Structure = ({
  item,
}: {
  item: { id: string; config: GithubOrganizationTeamStructure };
}) => {
  return (
    <>
      <Heading>{item.config.organizationName}</Heading>
      {item.config.teams.map(team => {
        return (
          <Card key={`${item.id}-${team.name}`}>
            <Heading>
              <GithubTeamLink
                organization={item.config.organizationName}
                team={team.name}
              />
            </Heading>
            {team.members.map(member => (
              <div key={`${item.id}-${team.name}-${member.username}`}>
                <GithubUserLink member={member} />
              </div>
            ))}
          </Card>
        );
      })}
      <CopyPastable text={JSON.stringify(item.config, null, 2)} />
    </>
  );
};
