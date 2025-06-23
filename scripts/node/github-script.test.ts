import {
  describe,
  expect,
  beforeAll,
  afterEach,
  it,
  jest,
} from '@jest/globals';
import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { GithubService } from './github.service';
import { GithubOrganizationTeamStructure } from './github.types';
import { configureGithubTeams } from './script';

jest.setTimeout(30000);

describe('GitHub Team Configuration', () => {
  const ORGANIZATION_NAME = 'gh-managment-test-org';
  let organizationData: GithubOrganizationTeamStructure;

  beforeAll(async () => {
    organizationData = FileSystemUtils.getObjectFromFilepath(
      './test-teams.json',
    ) as GithubOrganizationTeamStructure;
  });

  afterEach(async () => {
    await GithubService.deleteAllTeams(ORGANIZATION_NAME);
  });

  it('should configure GitHub teams to match the provided structure', async () => {
    await configureGithubTeams(organizationData);
    const structure = await GithubService.getOrgStructure(ORGANIZATION_NAME);
    expect(structure).toEqual(organizationData);
  });
});
