'use client';

import { Text, Badge } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { authFetch } from '../../../../libs/auth';

interface PlaylistInfo {
  name: string;
  songCount: number;
  totalSize: number;
  formattedSize: string;
}

export const DjMusicUtilityContent = () => {
  const [djLoading, setDjLoading] = useState(false);
  const [djMessage, setDjMessage] = useState<string | null>(null);
  const [djError, setDjError] = useState<string | null>(null);
  const [playlistsExpanded, setPlaylistsExpanded] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await authFetch(API_ENDPOINTS.DJ_PLAYLISTS);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch playlists');
      }

      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleDjDownload = async () => {
    setDjLoading(true);
    setDjMessage(null);
    setDjError(null);

    try {
      const response = await authFetch(API_ENDPOINTS.DJ_DOWNLOAD, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start download');
      }

      setDjMessage(data.message);
      if (playlistsExpanded) {
        setTimeout(() => fetchPlaylists(), 2000);
      }
    } catch (err) {
      setDjError(
        err instanceof Error ? err.message : 'Failed to start download',
      );
    } finally {
      setDjLoading(false);
    }
  };

  const handleOpenRekordBox = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.DJ_OPEN_REKORDBOX, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open RekordBox');
      }
    } catch (err) {
      setDjError(
        err instanceof Error ? err.message : 'Failed to open RekordBox',
      );
    }
  };

  const totalSongs = playlists.reduce((sum, p) => sum + p.songCount, 0);

  return (
    <>
      <div className="flex gap-2 justify-between">
        <Button
          onClick={handleDjDownload}
          disabled={djLoading}
          loading={djLoading}
          style={{ flex: 1 }}
        >
          Download DJ Music
        </Button>
        <Button onClick={handleOpenRekordBox} variant="outline">
          Open RekordBox
        </Button>
      </div>

      {djMessage && (
        <Text size="2" color="green">
          {djMessage}
        </Text>
      )}

      {djError && (
        <Text size="2" color="red">
          {djError}
        </Text>
      )}

      <Button
        onClick={() => setPlaylistsExpanded(!playlistsExpanded)}
        variant="secondary"
        style={{ justifyContent: 'space-between' }}
      >
        <div className="flex items-center gap-2">
          <Text>Downloaded Playlists</Text>
          {playlists.length > 0 && (
            <Badge color="blue" variant="solid">
              {playlists.length}{' '}
              {playlists.length === 1 ? 'Playlist' : 'Playlists'}, {totalSongs}{' '}
              {totalSongs === 1 ? 'song' : 'songs'}
            </Badge>
          )}
        </div>
        {playlistsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Button>

      {playlistsExpanded && (
        <div className="flex flex-col gap-2">
          {loadingPlaylists ? (
            <Text size="2" color="gray">
              Loading playlists...
            </Text>
          ) : playlists.length === 0 ? (
            <Text size="2" color="gray">
              No playlists found
            </Text>
          ) : (
            playlists.map(playlist => (
              <div
                className="flex items-center justify-between p-2"
                key={playlist.name}
                style={{
                  backgroundColor: 'var(--gray-a2)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <div className="flex flex-col gap-1">
                  <Text size="2" weight="medium">
                    {playlist.name}
                  </Text>
                  <Text size="1" color="gray">
                    {playlist.formattedSize}
                  </Text>
                </div>
                <Badge color="green" variant="soft">
                  {playlist.songCount}{' '}
                  {playlist.songCount === 1 ? 'song' : 'songs'}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};
