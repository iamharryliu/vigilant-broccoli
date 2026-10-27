import { PM2_ACTION } from '@vigilant-broccoli/devops-cli';
import { handlePm2ProcessAction } from '../_lib/pm2-action.utils';

export async function POST(request: Request) {
  return handlePm2ProcessAction(request, PM2_ACTION.RESTART);
}
