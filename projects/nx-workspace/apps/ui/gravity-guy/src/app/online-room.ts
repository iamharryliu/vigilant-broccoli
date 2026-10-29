'use client';

import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  advance,
  createOnlineRun,
  flip,
  playersOf,
  WORLD,
  type Run,
} from './engine';

export const ROOM_SIZE = 4;
const DIRECTORY = 'gravity-guy-directory';
const ROOM_PREFIX = 'gravity-guy-room:';
const BROADCAST = 'broadcast';
const SNAPSHOT = 'snapshot';
const INPUT = 'input';
const REQUEST = 'request';
const COUNTDOWN_MS = 5000;
const TICK_MS = 100;
const STALE_MS = 8000;
const GRACE_MS = 1800;
export const ONLINE_AVAILABLE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

type Member = {
  id: string;
  joinedAt: number;
  room: string | null;
  playing: boolean;
};
type Snapshot = {
  hostId: string;
  roundId: string;
  seats: string[];
  startsAt: number | null;
  run: Run | null;
};
type Connection = 'connecting' | 'connected' | 'error';
const byArrival = (a: Member, b: Member) =>
  a.joinedAt - b.joinedAt || a.id.localeCompare(b.id);
const membersOf = (channel: RealtimeChannel) =>
  Object.values(channel.presenceState<Member>())
    .map(entries => entries[0])
    .filter(
      member =>
        member &&
        typeof member.id === 'string' &&
        Number.isFinite(member.joinedAt),
    )
    .sort(byArrival);
const send = (channel: RealtimeChannel, event: string, payload: object) =>
  channel.send({ type: BROADCAST, event, payload });

let realtimeClient: SupabaseClient | null = null;
const getClient = () => {
  realtimeClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return realtimeClient;
};

export function useOnlineRoom() {
  const [identity] = useState(() => ({
    id: crypto.randomUUID(),
    joinedAt: Date.now(),
  }));
  const [room, setRoom] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection>('connecting');
  const [members, setMembers] = useState<Member[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const state = useRef<Snapshot | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const directoryRef = useRef<RealtimeChannel | null>(null);
  const directoryMembers = useRef<Member[]>([]);
  const membersRef = useRef<Member[]>([]);
  const roomRef = useRef(room);
  roomRef.current = room;
  const pending = useRef(new Map<string, number>());
  const sequence = useRef(0);
  const lastInput = useRef(new Map<string, number>());
  const playing = Boolean(snapshot?.startsAt || snapshot?.run);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const hostOf = useCallback(() => {
    const current = membersRef.current;
    const known = state.current?.hostId;
    return current.some(member => member.id === known) ? known : current[0]?.id;
  }, []);

  useEffect(() => {
    if (!ONLINE_AVAILABLE) return;
    const client = getClient();
    const directory = client.channel(DIRECTORY, {
      config: { presence: { key: identity.id } },
    });
    directoryRef.current = directory;
    let disposed = false;
    let matchmakingTimer: ReturnType<typeof setTimeout>;
    const matchmake = () => {
      if (disposed || playingRef.current) return;
      const listings = directoryMembers.current;
      const lockedRooms = new Set(
        listings.filter(member => member.playing).map(member => member.room),
      );
      const waiting = listings.filter(
        member =>
          !member.playing && (!member.room || !lockedRooms.has(member.room)),
      );
      const index = waiting.findIndex(member => member.id === identity.id);
      if (index < 0) return;
      // Repack all waiting players, including partial rooms, so concurrent joins converge.
      const next = waiting[Math.floor(index / ROOM_SIZE) * ROOM_SIZE].id;
      if (next === roomRef.current) return;
      state.current = null;
      setSnapshot(null);
      roomRef.current = next;
      setRoom(next);
    };
    directory.on('presence', { event: 'sync' }, () => {
      directoryMembers.current = membersOf(directory);
      clearTimeout(matchmakingTimer);
      matchmakingTimer = setTimeout(matchmake, 500);
    });
    directory.subscribe(status => {
      if (disposed) return;
      if (status === 'SUBSCRIBED') {
        setConnection('connected');
        void directory.track({
          ...identity,
          room: roomRef.current,
          playing: playingRef.current,
        });
      } else if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      )
        setConnection('error');
    });
    const pagehide = () => {
      void directory.untrack();
      void channelRef.current?.untrack();
    };
    const pageshow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void directory.track({
        ...identity,
        room: roomRef.current,
        playing: playingRef.current,
      });
      if (channelRef.current) {
        void channelRef.current.track({
          ...identity,
          room: roomRef.current,
          playing: playingRef.current,
        });
        void send(channelRef.current, REQUEST, {});
      }
    };
    window.addEventListener('pagehide', pagehide);
    window.addEventListener('pageshow', pageshow);
    return () => {
      disposed = true;
      clearTimeout(matchmakingTimer);
      window.removeEventListener('pagehide', pagehide);
      window.removeEventListener('pageshow', pageshow);
      directoryRef.current = null;
      void directory.untrack();
      void client.removeChannel(directory);
    };
  }, [identity]);

  useEffect(() => {
    void directoryRef.current?.track({ ...identity, room, playing });
  }, [identity, room, playing]);

  useEffect(() => {
    if (!room) return;
    const client = getClient();
    const channel = client.channel(`${ROOM_PREFIX}${room}`, {
      config: { presence: { key: identity.id }, broadcast: { self: false } },
    });
    channelRef.current = channel;
    let disposed = false;
    let ready = false;
    let subscribedAt = Date.now();
    let lastSnapshot = Date.now();
    let ticks = 0;
    const inputs = pending.current;
    const seenInputs = lastInput.current;
    const publish = (next: Snapshot) => {
      state.current = next;
      setSnapshot(next);
      void send(channel, SNAPSHOT, next);
    };
    const requeue = () => {
      roomRef.current = null;
      setRoom(null);
      state.current = null;
      setSnapshot(null);
      void directoryRef.current?.track({
        ...identity,
        room: null,
        playing: false,
      });
    };
    channel.on('presence', { event: 'sync' }, () => {
      if (disposed) return;
      const next = membersOf(channel);
      membersRef.current = next;
      setMembers(next);
      if (
        ready &&
        next.some(member => member.id === identity.id) &&
        !state.current?.run &&
        !next.slice(0, ROOM_SIZE).some(member => member.id === identity.id)
      )
        requeue();
    });
    channel.on(BROADCAST, { event: SNAPSHOT }, ({ payload }) => {
      if (disposed || !payload || typeof payload !== 'object') return;
      const incoming = payload as Snapshot;
      if (
        !membersRef.current.some(member => member.id === incoming.hostId) ||
        (state.current && incoming.hostId !== hostOf()) ||
        !Array.isArray(incoming.seats) ||
        incoming.seats.length > ROOM_SIZE ||
        typeof incoming.roundId !== 'string'
      )
        return;
      if (
        incoming.run &&
        (!Array.isArray(incoming.run.onlinePlayers) ||
          incoming.run.onlinePlayers.length !== incoming.seats.length - 1 ||
          !Number.isFinite(incoming.run.camera))
      )
        return;
      if (
        (incoming.run || incoming.startsAt) &&
        !incoming.seats.includes(identity.id)
      ) {
        requeue();
        return;
      }
      lastSnapshot = Date.now();
      state.current = incoming;
      setSnapshot(incoming);
      setConnection('connected');
    });
    channel.on(BROADCAST, { event: REQUEST }, () => {
      if (hostOf() === identity.id && state.current)
        void send(channel, SNAPSHOT, state.current);
    });
    channel.on(BROADCAST, { event: INPUT }, ({ payload }) => {
      if (!payload || typeof payload !== 'object') return;
      const current = state.current;
      if (
        hostOf() !== identity.id ||
        !current?.run ||
        payload.roundId !== current.roundId ||
        typeof payload.id !== 'string' ||
        !Number.isSafeInteger(payload.sequence)
      )
        return;
      if (
        !current.seats.includes(payload.id) ||
        !membersRef.current.some(member => member.id === payload.id)
      )
        return;
      if (payload.sequence <= (lastInput.current.get(payload.id) ?? -1)) return;
      lastInput.current.set(payload.id, payload.sequence);
      pending.current.set(payload.id, payload.sequence);
    });
    channel.subscribe(status => {
      if (disposed) return;
      if (status === 'SUBSCRIBED') {
        ready = true;
        subscribedAt = Date.now();
        setConnection('connected');
        void channel.track({ ...identity, room, playing: false });
        void send(channel, REQUEST, {});
      } else if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        ready = false;
        setConnection('error');
      }
    });
    const timer = window.setInterval(() => {
      if (!ready) return;
      const present = membersRef.current;
      if (hostOf() !== identity.id) {
        if (Date.now() - lastSnapshot > STALE_MS) setConnection('error');
        return;
      }
      if (Date.now() - subscribedAt < GRACE_MS) return;
      setConnection('connected');
      const seats = present.slice(0, ROOM_SIZE).map(member => member.id);
      let current = state.current ?? {
        hostId: identity.id,
        roundId: crypto.randomUUID(),
        seats,
        startsAt: null,
        run: null,
      };
      current = { ...current, hostId: identity.id };
      if (!current.run) {
        const sameSeats = seats.join() === current.seats.join();
        const startsAt =
          seats.length === ROOM_SIZE
            ? ((sameSeats ? current.startsAt : null) ??
              Date.now() + COUNTDOWN_MS)
            : null;
        current = { ...current, seats, startsAt };
        if (startsAt && Date.now() >= startsAt)
          current = {
            ...current,
            startsAt: null,
            run: createOnlineRun(seats.length),
          };
      } else if (current.run.status === 'running') {
        const run = structuredClone(current.run);
        const players = playersOf(run);
        for (const [index, id] of current.seats.entries()) {
          if (!present.some(member => member.id === id))
            players[index].out = true;
          if (pending.current.has(id)) flip(run, index + 1);
        }
        pending.current.clear();
        for (let step = 0; step < TICK_MS / 1000 / WORLD.step; step++)
          advance(run);
        current = { ...current, run };
      }
      // Lobby heartbeats also let guests detect a host tab that stopped scheduling.
      if (
        current.run?.status === 'running' ||
        ++ticks % 10 === 0 ||
        JSON.stringify(current.seats) !==
          JSON.stringify(state.current?.seats) ||
        current.startsAt !== state.current?.startsAt ||
        current.run?.status !== state.current?.run?.status
      )
        publish(current);
      else state.current = current;
    }, TICK_MS);
    return () => {
      disposed = true;
      clearInterval(timer);
      channelRef.current = null;
      membersRef.current = [];
      inputs.clear();
      seenInputs.clear();
      setMembers([]);
      void channel.untrack();
      void client.removeChannel(channel);
    };
  }, [room, identity, hostOf]);

  const requestFlip = useCallback(() => {
    const current = state.current;
    if (!current?.run || current.run.status !== 'running') return;
    sequence.current += 1;
    if (hostOf() === identity.id)
      pending.current.set(identity.id, sequence.current);
    else if (channelRef.current)
      void send(channelRef.current, INPUT, {
        id: identity.id,
        roundId: current.roundId,
        sequence: sequence.current,
      });
  }, [identity, hostOf]);
  return {
    room,
    connection,
    members,
    snapshot,
    userId: identity.id,
    requestFlip,
  };
}
