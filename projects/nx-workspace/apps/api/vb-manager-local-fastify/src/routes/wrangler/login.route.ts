import { WranglerService } from '@vigilant-broccoli/devops-cli';

export async function POST() {
  WranglerService.login();
  return Response.json({ success: true });
}
