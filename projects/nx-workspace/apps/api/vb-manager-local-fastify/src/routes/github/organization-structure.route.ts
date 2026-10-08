import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { GithubService } from '@vigilant-broccoli/github-workspace';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const res = await GithubService.getOrgStructure(organization);
  FileSystemUtils.writeJSON(`./github-configurations/${organization}`, res);
  return Response.json(res);
}
