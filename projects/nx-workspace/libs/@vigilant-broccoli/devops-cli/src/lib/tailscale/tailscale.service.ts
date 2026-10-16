import { toLines, tryRunCli } from '../cli/cli.utils';

const TAILSCALE_CLI = 'tailscale';
const TailscaleCommand = {
  listIpv4: ['ip', '-4'],
};

// The CLI is absent on machines that only reach the tailnet through the API.
const getLocalIps = async (): Promise<string[]> => {
  const output = await tryRunCli(TAILSCALE_CLI, TailscaleCommand.listIpv4);
  return output ? toLines(output) : [];
};

export const TailscaleService = {
  getLocalIps,
};
