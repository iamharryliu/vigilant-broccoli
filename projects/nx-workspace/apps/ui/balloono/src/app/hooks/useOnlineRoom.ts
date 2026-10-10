import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BotMemory } from '../engine/cpu';
import {
  MATCH_STATUS,
  MAX_PLAYERS,
  NO_INPUT,
  TICK_MS,
} from '../engine/game.consts';
import {
  Contender,
  Difficulty,
  MatchState,
  PlayerInput,
} from '../engine/game.types';
import { createMatch, eliminatePlayers } from '../engine/match';
import { cpuContenders, fillSeats, runTick } from '../engine/runner';
import { supabase } from '../../lib/supabase';
import { Controls } from './useControls';

const CHANNEL_PREFIX = 'balloono-room:';
const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const BROADCAST_EVENT = 'broadcast';
const ROOM_EVENT = 'room';
const INPUT_EVENT = 'input';
const SYNC_REQUEST_EVENT = 'sync-request';
const PAGEHIDE_EVENT = 'pagehide';

// Snapshots go out every other tick: smooth enough with client-side easing,
// and half the Supabase Realtime message budget of a per-tick broadcast.
const SNAPSHOT_EVERY_TICKS = 2;
// A newcomer whose clock runs early could out-rank the real host by join time;
// waiting for the host's first snapshot before claiming the room avoids that.
const HOST_CLAIM_GRACE_MS = 1500;

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
} as const;

export const CONNECTION = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export type Connection = (typeof CONNECTION)[keyof typeof CONNECTION];

export interface RoomMember {
  userId: string;
  username: string;
  joinedAt: number;
}

export interface RoomSnapshot {
  hostId: string;
  cpus: Difficulty[];
  wins: Record<string, number>;
  match: MatchState | null;
}

interface InputMessage {
  userId: string;
  input: PlayerInput;
}

const EMPTY_SNAPSHOT: Omit<RoomSnapshot, 'hostId'> = {
  cpus: [],
  wins: {},
  match: null,
};

const byJoinOrder = (a: RoomMember, b: RoomMember) =>
  a.joinedAt - b.joinedAt || a.userId.localeCompare(b.userId);

const sameInput = (a: PlayerInput, b: PlayerInput) =>
  a.direction === b.direction && a.placeBalloon === b.placeBalloon;

export function useOnlineRoom({
  room,
  userId,
  username,
  controls,
  cpuName,
}: {
  room: string;
  userId: string;
  username: string;
  controls: Controls;
  cpuName: (difficulty: Difficulty, index: number) => string;
}) {
  const [connection, setConnection] = useState<Connection>(
    CONNECTION.CONNECTING,
  );
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [knownHostId, setKnownHostId] = useState<string | null>(null);
  const [graceOver, setGraceOver] = useState(false);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const membersRef = useRef(members);
  membersRef.current = members;
  const usernameRef = useRef(username);
  usernameRef.current = username;
  const remoteInputsRef = useRef<Record<string, PlayerInput>>({});

  const hostId = useMemo(() => {
    if (knownHostId && members.some(member => member.userId === knownHostId)) {
      return knownHostId;
    }
    return members[0]?.userId ?? null;
  }, [knownHostId, members]);
  const isHost = hostId === userId && (graceOver || knownHostId === userId);
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  const broadcast = useCallback((event: string, payload: object) => {
    void channelRef.current?.send({ type: BROADCAST_EVENT, event, payload });
  }, []);

  const publish = useCallback(
    (next: typeof EMPTY_SNAPSHOT) => {
      setSnapshot(next);
      broadcast(ROOM_EVENT, { ...next, hostId: userId });
    },
    [broadcast, userId],
  );

  useEffect(() => {
    if (!room || !userId) return;
    const joinedAt = Date.now();
    const channel = supabase.channel(`${CHANNEL_PREFIX}${room}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });

    channel.on(PRESENCE_EVENT, { event: SYNC_EVENT }, () => {
      const state = channel.presenceState<RoomMember>();
      setMembers(
        Object.values(state)
          .map(presences => presences[0])
          .filter(Boolean)
          .map(({ userId: id, username: name, joinedAt: at }) => ({
            userId: id,
            username: name,
            joinedAt: at,
          }))
          .sort(byJoinOrder),
      );
    });

    channel.on(BROADCAST_EVENT, { event: ROOM_EVENT }, ({ payload }) => {
      const incoming = payload as RoomSnapshot;
      const ranked = membersRef.current;
      const senderRank = ranked.findIndex(m => m.userId === incoming.hostId);
      const myRank = ranked.findIndex(m => m.userId === userId);
      // Two clients briefly both hosting resolve to the earlier joiner.
      if (isHostRef.current && (senderRank === -1 || senderRank > myRank)) {
        return;
      }
      setKnownHostId(incoming.hostId);
      setSnapshot({
        cpus: incoming.cpus,
        wins: incoming.wins,
        match: incoming.match,
      });
    });

    channel.on(BROADCAST_EVENT, { event: INPUT_EVENT }, ({ payload }) => {
      const { userId: sender, input } = payload as InputMessage;
      const previous = remoteInputsRef.current[sender] ?? NO_INPUT;
      remoteInputsRef.current[sender] = {
        direction: input.direction,
        placeBalloon: previous.placeBalloon || input.placeBalloon,
      };
    });

    channel.on(BROADCAST_EVENT, { event: SYNC_REQUEST_EVENT }, () => {
      if (!isHostRef.current) return;
      broadcast(ROOM_EVENT, { ...snapshotRef.current, hostId: userId });
    });

    channel.subscribe(status => {
      if (status === SUBSCRIBE_STATUS.SUBSCRIBED) {
        setConnection(CONNECTION.CONNECTED);
        void channel.track({
          userId,
          username: usernameRef.current,
          joinedAt,
        });
        void channel.send({
          type: BROADCAST_EVENT,
          event: SYNC_REQUEST_EVENT,
          payload: {},
        });
        return;
      }
      if (
        status === SUBSCRIBE_STATUS.CHANNEL_ERROR ||
        status === SUBSCRIBE_STATUS.TIMED_OUT
      ) {
        setConnection(CONNECTION.ERROR);
      }
    });
    channelRef.current = channel;

    const graceTimer = window.setTimeout(
      () => setGraceOver(true),
      HOST_CLAIM_GRACE_MS,
    );
    const handlePageHide = () => {
      void channel.untrack();
    };
    window.addEventListener(PAGEHIDE_EVENT, handlePageHide);

    return () => {
      window.clearTimeout(graceTimer);
      window.removeEventListener(PAGEHIDE_EVENT, handlePageHide);
      void channel.untrack();
      void supabase.removeChannel(channel);
      channelRef.current = null;
      remoteInputsRef.current = {};
      setMembers([]);
      setKnownHostId(null);
      setGraceOver(false);
      setSnapshot(EMPTY_SNAPSHOT);
      setConnection(CONNECTION.CONNECTING);
    };
  }, [room, userId, broadcast]);

  useEffect(() => {
    const channel = channelRef.current;
    const me = members.find(member => member.userId === userId);
    if (!channel || !me || me.username === username) return;
    void channel.track({ userId, username, joinedAt: me.joinedAt });
  }, [username, members, userId]);

  const playing = snapshot.match?.status === MATCH_STATUS.PLAYING;

  // Host: run the authoritative simulation, picking up from the last snapshot
  // when the role migrates mid-match.
  useEffect(() => {
    if (!isHost || !playing) return;
    const botMemory: BotMemory = new Map();
    let state = snapshotRef.current.match as MatchState;
    const interval = window.setInterval(() => {
      const present = new Set(membersRef.current.map(m => m.userId));
      const departed = state.players
        .filter(
          player =>
            player.alive && !player.difficulty && !present.has(player.id),
        )
        .map(player => player.id);
      const remote = remoteInputsRef.current;
      const inputs = { ...remote, [userId]: controls.takeInput() };
      remoteInputsRef.current = Object.fromEntries(
        Object.entries(remote).map(([id, input]) => [
          id,
          { ...input, placeBalloon: false },
        ]),
      );
      state = runTick(eliminatePlayers(state, departed), inputs, botMemory);

      const over = state.status === MATCH_STATUS.OVER;
      const { winnerId } = state;
      const wins =
        over && winnerId
          ? {
              ...snapshotRef.current.wins,
              [winnerId]: (snapshotRef.current.wins[winnerId] ?? 0) + 1,
            }
          : snapshotRef.current.wins;
      const next = { ...snapshotRef.current, wins, match: state };
      snapshotRef.current = next;
      if (over || state.tick % SNAPSHOT_EVERY_TICKS === 0) publish(next);
      else setSnapshot(next);
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [isHost, playing, userId, controls, publish]);

  // Guest: forward input changes to the host instead of streaming every tick.
  useEffect(() => {
    if (isHost || !playing) return;
    let lastSent: PlayerInput = NO_INPUT;
    const interval = window.setInterval(() => {
      const input = controls.takeInput();
      if (sameInput(input, lastSent) && !input.placeBalloon) return;
      lastSent = { ...input, placeBalloon: false };
      broadcast(INPUT_EVENT, { userId, input });
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [isHost, playing, userId, controls, broadcast]);

  const seated = members.slice(0, MAX_PLAYERS);

  const setCpus = useCallback(
    (cpus: Difficulty[]) => {
      if (!isHost) return;
      publish({
        ...snapshotRef.current,
        cpus: cpus.slice(0, MAX_PLAYERS - 1),
      });
    },
    [isHost, publish],
  );

  const startMatch = useCallback(() => {
    if (!isHost) return;
    const humans: Contender[] = membersRef.current
      .slice(0, MAX_PLAYERS)
      .map(member => ({
        id: member.userId,
        name: member.username,
        difficulty: null,
      }));
    const contenders = fillSeats(
      humans,
      cpuContenders(snapshotRef.current.cpus, cpuName),
    );
    remoteInputsRef.current = {};
    publish({ ...snapshotRef.current, match: createMatch(contenders) });
  }, [isHost, publish, cpuName]);

  const backToLobby = useCallback(() => {
    if (!isHost) return;
    publish({ ...snapshotRef.current, match: null });
  }, [isHost, publish]);

  return {
    connection,
    members,
    seated,
    hostId,
    isHost,
    snapshot,
    setCpus,
    startMatch,
    backToLobby,
  };
}
