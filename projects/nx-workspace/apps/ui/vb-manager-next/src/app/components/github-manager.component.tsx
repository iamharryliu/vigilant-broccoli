'use client';

import { Button, Card, Heading, TextField } from '@radix-ui/themes';
import {
  downloadJson,
  FORM_TYPE,
  GithubOrganizationTeamStructure,
  GithubTeam,
  GithubTeamMember,
} from '@vigilant-broccoli/common-js';
import {
  CopyPastable,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { getBasename } from '../../lib/utils';
import Link from 'next/link';

const API_ROUTES = {
  CONFIGURATIONS: '/api/github/configurations',
  ORGANIZATION_STRUCTURE: '/api/github/organization-structure',
};

const GITHUB_TEAM_LIST_MANAGER_COPY = {
  LIST: {
    TITLE: 'Github Team Manager',
    EMPTY_MESSAGE: 'No items.',
  },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Create Item',
    DESCRIPTION: 'Create item description.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Item',
    DESCRIPTION: 'Update item description.',
  },
};

const Form = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<{ id: number; config: string }>) => {
  const [item, setItem] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    await submitHandler(item, formType);
    setIsSubmitting(false);
  }

  return (
    <>
      <div>
        <label htmlFor="name">Config</label>
        <input
          id="name"
          value={item.config}
          onChange={e =>
            setItem(prev => {
              return { ...prev, title: e.target.value };
            })
          }
        />
      </div>

      <Button onClick={handleSubmit} loading={isSubmitting} className="w-full">
        Submit
      </Button>
    </>
  );
};

function extractTeamLinks(orgData: GithubOrganizationTeamStructure): string[] {
  const links: string[] = [];

  function recurse(teams: GithubTeam[]) {
    for (const team of teams) {
      links.push(
        `https://github.com/orgs/${orgData.organizationName}/teams/${team.name}`,
      );
      recurse(team.teams);
    }
  }

  recurse(orgData.teams);
  return links;
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

const ListItemComponent = ({
  item,
}: {
  item: { id: string; config: GithubOrganizationTeamStructure };
}) => {
  return (
    <>
      <Heading>
        {getBasename(item.id, '.json')} ({item.config.organizationName})
      </Heading>

      <Heading size="3">Team Links</Heading>
      {extractTeamLinks(item.config).map(name => (
        <div key={name}>
          <Link href={name} target="blank" key={name}>
            {name.split('/').pop()}
          </Link>
        </div>
      ))}
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
      <CopyPastable text={JSON.stringify(item.config)} />
    </>
  );
};

export const GithubTeamManager = () => {
  const [teamSettings, setTeamSettings] = useState<
    { id: number; config: string }[]
  >([]);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationStructure, setOrganizationStructure] = useState<
    GithubOrganizationTeamStructure | undefined
  >(undefined);
  const [isOrgStructureLoading, setIsOrgStructureLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const res = await fetch(API_ROUTES.CONFIGURATIONS);
      setTeamSettings(await res.json());
    }
    init();
  }, []);

  async function getOrganizationStructure() {
    setIsOrgStructureLoading(true);
    const res = await fetch(
      `${API_ROUTES.ORGANIZATION_STRUCTURE}?organization=${organizationName}`,
    );
    setIsOrgStructureLoading(false);
    const data = await res.json();
    setOrganizationStructure(data);
  }

  async function downloadOrganizationStructure() {
    downloadJson(
      organizationStructure,
      `${organizationName}-team-structure.json`,
    );
  }

  return (
    <Card>
      <div>
        <TextField.Root
          placeholder="Organization name"
          value={organizationName}
          onChange={e => setOrganizationName(e.target.value)}
        />
        <Button
          onClick={getOrganizationStructure}
          loading={isOrgStructureLoading}
        >
          Fetch Organization Structure
        </Button>
      </div>
      <div>{JSON.stringify(organizationStructure)}</div>
      <div>
        {organizationStructure ? (
          <Button onClick={downloadOrganizationStructure}>
            Download Structure
          </Button>
        ) : null}
      </div>

      <CRUDItemList
        createItemFormDefaultValues={{ id: 0, config: '' }}
        items={teamSettings}
        setItems={setTeamSettings}
        ListItemComponent={ListItemComponent}
        FormComponent={Form}
        createItem={async () => {
          return { id: 2, config: '{}' };
        }}
        updateItem={async () => {
          return;
        }}
        // deleteItem={deleteItem}
        isCards={true}
        copy={GITHUB_TEAM_LIST_MANAGER_COPY}
      ></CRUDItemList>
    </Card>
  );
};
