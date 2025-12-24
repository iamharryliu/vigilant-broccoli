import { NextResponse } from 'next/server';
import { SpotifyService } from '../../../../services/spotify.service';

export async function POST() {
  const playlists = await SpotifyService.getPlaylists('mix');
  await SpotifyService.downloadPlaylists(playlists);
  return NextResponse.json({
    message: 'DJ music download completed successfully',
    status: 'completed',
    playlistCount: playlists.length,
  });
}
