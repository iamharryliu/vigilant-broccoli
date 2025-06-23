import {
  describe,
  expect,
  beforeAll,
  afterEach,
  it,
  jest,
  afterAll,
} from '@jest/globals';
import { GithubService } from './github.service';
import { GithubOrganizationTeamStructure } from './github.types';
import { configureGithubTeams } from './script';
import {
  DEFAULT_MOCK,
  DEFAULT_MOCK_LESS_1_TEAM,
  DEFAULT_MOCK_NO_TEAMS,
} from './mock.consts';

jest.setTimeout(90000);

describe('GitHub Team Configuration', () => {
  const ORGANIZATION_NAME = 'gh-managment-test-org';
  let organizationData: GithubOrganizationTeamStructure;

  afterAll(async () => {
    await GithubService.deleteAllTeams(ORGANIZATION_NAME);
  });

  it('should configure GitHub teams to match the provided structure', async () => {
    let organizationData = DEFAULT_MOCK as GithubOrganizationTeamStructure;
    await configureGithubTeams(organizationData);
    let structure = await GithubService.getOrgStructure(ORGANIZATION_NAME);
    expect(structure).toEqual(organizationData);

    organizationData =
      DEFAULT_MOCK_LESS_1_TEAM as GithubOrganizationTeamStructure;
    await configureGithubTeams(organizationData);
    structure = await GithubService.getOrgStructure(ORGANIZATION_NAME);
    expect(structure).toEqual(organizationData);

    // TODO: implement flags for config types
    // organizationData = DEFAULT_MOCK_NO_TEAMS as GithubOrganizationTeamStructure
    // await configureGithubTeams(organizationData);
    //  structure = await GithubService.getOrgStructure(ORGANIZATION_NAME);
    // expect(structure).toEqual(organizationData);
  });
});
