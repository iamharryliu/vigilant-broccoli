'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  CardContainer,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { GraphView } from '@vigilant-broccoli/react-utility';
import type { NoteGraph, NoteGraphLink } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  SPOTIFY_ERROR_QUERY_PARAM,
  SPOTIFY_OAUTH_ERROR,
} from '../constants/spotify.consts';
import type { SpotifyPlaylistDetail } from '../../../libs/spotify-graph';

type Status = 'loading' | 'disconnected' | 'ready' | 'error';

interface SpotifyGraphResponse {
  connected: boolean;
  nodes?: NoteGraph['nodes'];
  links?: NoteGraphLink[];
  playlists?: Record<string, SpotifyPlaylistDetail>;
}

const DEFAULT_MIN_SHARED_TRACKS = 1;
const FORCE_QUERY = '?force=true';

const errorMessage = (code: string): string => {
  switch (code) {
    case SPOTIFY_OAUTH_ERROR.INVALID_STATE:
      return 'That Spotify sign-in link expired — try connecting again.';
    case SPOTIFY_OAUTH_ERROR.MISSING_CODE:
      return 'Spotify did not return an authorization code — try connecting again.';
    default:
      return 'Connecting to Spotify failed — try again.';
  }
};

export function SpotifyPlaylistGraphComponent() {
  const [status, setStatus] = useState<Status>('loading');
  const [graph, setGraph] = useState<SpotifyGraphResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [minSharedTracks, setMinSharedTracks] = useState(
    DEFAULT_MIN_SHARED_TRACKS,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get(
      SPOTIFY_ERROR_QUERY_PARAM,
    );
    if (code) setConnectError(errorMessage(code));
  }, []);

  const loadGraph = useCallback(async (force = false) => {
    const response = await authFetch(
      `${API_ENDPOINTS.SPOTIFY_GRAPH}${force ? FORCE_QUERY : ''}`,
    );
    if (!response.ok) {
      setStatus('error');
      return;
    }
    const data: SpotifyGraphResponse = await response.json();
    setGraph(data);
    setStatus(data.connected ? 'ready' : 'disconnected');
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleConnect = async () => {
    const response = await authFetch(API_ENDPOINTS.SPOTIFY_AUTH_LOGIN);
    const { authorizeUrl } = await response.json();
    window.location.href = authorizeUrl;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGraph(true);
    setRefreshing(false);
  };

  const filteredGraph: NoteGraph = useMemo(
    () => ({
      nodes: graph?.nodes ?? [],
      links: (graph?.links ?? []).filter(
        link => (link.value ?? 1) >= minSharedTracks,
      ),
    }),
    [graph, minSharedTracks],
  );

  const selectedPlaylist = selectedId
    ? graph?.playlists?.[selectedId]
    : undefined;

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Text size="3">Loading…</Text>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-full items-center justify-center">
        <Text size="3">
          Couldn&apos;t load your Spotify playlists. Try refreshing the page.
        </Text>
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="flex h-full items-center justify-center">
        <CardContainer title="Connect Spotify">
          <Text size="2">
            See how your playlists relate to each other by shared tracks.
          </Text>
          {connectError && (
            <Text size="2" color="red">
              {connectError}
            </Text>
          )}
          <Button onClick={handleConnect}>Connect Spotify</Button>
        </CardContainer>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 p-2 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <Text size="2">Min shared tracks</Text>
          <Input
            type="number"
            min={1}
            value={minSharedTracks}
            onChange={e =>
              setMinSharedTracks(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-20"
          />
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden">
        <div className="flex-1 rounded-md border border-input overflow-hidden">
          <GraphView
            graph={filteredGraph}
            activePath={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {selectedPlaylist && (
          <div className="w-72 shrink-0">
            <CardContainer
              title={selectedPlaylist.name}
              headerLink={{ href: selectedPlaylist.url, label: 'Open' }}
            >
              <Text size="2">Owner: {selectedPlaylist.owner}</Text>
              <Text size="2">Tracks: {selectedPlaylist.trackCount}</Text>
              <Text size="2">Top genre: {selectedPlaylist.group}</Text>
            </CardContainer>
          </div>
        )}
      </div>
    </div>
  );
}
