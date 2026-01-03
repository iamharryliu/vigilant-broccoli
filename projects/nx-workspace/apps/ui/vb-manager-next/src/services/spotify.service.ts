import {
  getEnvironmentVariable,
  ShellUtils,
} from '@vigilant-broccoli/common-node';
import { VB_REPO_PATH } from '@vigilant-broccoli/personal-common-js';

export interface SpotifyPlaylist {
  name: string;
  url: string;
}


const OUTPUT_PATH = '~/My Drive/DJ Music Library';

function runPythonScript(
  scriptName: string,
  args: string[],
  timeout = 30000,
): Promise<string> {
  const command = `cd ${VB_REPO_PATH.SPOTIFY_TO_MP3_SCRIPT} && source venv/bin/activate && python ${scriptName} ${args.join(' ')}`;

  return ShellUtils.runShellCommand(
    command,
    true,
    {
      SPOTIFY_CLIENT_ID: getEnvironmentVariable('SPOTIFY_CLIENT_ID'),
      SPOTIFY_CLIENT_SECRET: getEnvironmentVariable('SPOTIFY_CLIENT_SECRET'),
    },
    timeout,
  ) as Promise<string>;
}

export const SpotifyService = {
  async getPlaylists(descriptionFilter = ''): Promise<SpotifyPlaylist[]> {
    const stdout = await runPythonScript('get_playlists.py', [
      '--filter',
      `'${descriptionFilter}'`,
    ]);
    return JSON.parse(stdout);
  },

  async downloadPlaylists(
    playlists: SpotifyPlaylist[],
    outputPath = OUTPUT_PATH,
  ): Promise<void> {
    const playlistsJson = JSON.stringify(playlists).replace(/'/g, "'\\''");
    await runPythonScript(
      'download_music.py',
      ['--output', `'${outputPath}'`, '--playlists', `'${playlistsJson}'`],
      600000,
    );
  },
};
