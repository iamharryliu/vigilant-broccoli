'use client';

import { Flex, Text, Button, Badge } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CardContainer } from './card-container.component';

interface PlaylistInfo {
  name: string;
  songCount: number;
  totalSize: number;
  formattedSize: string;
}

// eslint-disable-next-line complexity
export const DjDownloadComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await fetch(API_ENDPOINTS.DJ_PLAYLISTS);
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

  const handleDownload = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.DJ_DOWNLOAD, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start download');
      }

      setMessage(data.message);
      if (expanded) {
        setTimeout(() => fetchPlaylists(), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start download');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRekordBox = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DJ_OPEN_REKORDBOX, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open RekordBox');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open RekordBox');
    }
  };

  const totalSongs = playlists.reduce((sum, p) => sum + p.songCount, 0);

  return (
    <CardContainer
      title="DJ Music"
      gap="3"
      headerAction={
        <Button
          onClick={handleOpenRekordBox}
          size="2"
          variant="outline"
        >
          Open RekordBox
        </Button>
      }
    >
      <Button
          onClick={handleDownload}
          disabled={loading}
          loading={loading}
          size="3"
          variant="solid"
        >
          Download DJ Music
        </Button>

        {message && (
          <Text size="2" color="green">{message}</Text>
        )}

        {error && (
          <Text size="2" color="red">{error}</Text>
        )}
        <Button
          onClick={() => setExpanded(!expanded)}
          variant="soft"
          size="2"
          style={{ justifyContent: 'space-between' }}
        >
          <Flex align="center" gap="2">
            <Text>Downloaded Playlists</Text>
            {playlists.length > 0 && (
              <Badge color="blue" variant="solid">
                {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}, {totalSongs} {totalSongs === 1 ? 'song' : 'songs'}
              </Badge>
            )}
          </Flex>
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>

        {expanded && (
          <Flex direction="column" gap="2">
            {loadingPlaylists ? (
              <Text size="2" color="gray">Loading playlists...</Text>
            ) : playlists.length === 0 ? (
              <Text size="2" color="gray">No playlists found</Text>
            ) : (
              playlists.map((playlist) => (
                <Flex
                  key={playlist.name}
                  align="center"
                  justify="between"
                  p="2"
                  style={{
                    backgroundColor: 'var(--gray-a2)',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">{playlist.name}</Text>
                    <Text size="1" color="gray">{playlist.formattedSize}</Text>
                  </Flex>
                  <Badge color="green" variant="soft">
                    {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                  </Badge>
                </Flex>
              ))
            )}
          </Flex>
        )}
    </CardContainer>
  );
};
