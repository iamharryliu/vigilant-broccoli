import { FileSystemUtils } from "@vigilant-broccoli/common-node";
import { configureGithubTeams } from "./script";
import { GithubOrganizationTeamStructure } from "./github.types";
import { GithubService } from "./github.service";

const ORGANIZATION_NAME = 'elva-11';
const TEAM_CONFIG_FILEPATH = './tillmobil-team.json';

(async ()=>{
    const organizationData: GithubOrganizationTeamStructure = FileSystemUtils.getObjectFromFilepath(TEAM_CONFIG_FILEPATH)
    await configureGithubTeams(organizationData);
    await GithubService.getOrgStructure(ORGANIZATION_NAME);
})()