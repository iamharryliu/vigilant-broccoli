export interface WhiteboardPresencePayload {
  username: string;
}

export interface BroadcastPresenceChannel {
  on(
    event: 'presence',
    filter: { event: 'sync' },
    callback: () => void,
  ): BroadcastPresenceChannel;
  on(
    event: 'broadcast',
    filter: { event: string },
    callback: (message: { payload: unknown }) => void,
  ): BroadcastPresenceChannel;
  subscribe(callback: (status: string) => void): BroadcastPresenceChannel;
  presenceState<T>(): Record<string, T[]>;
  track(payload: WhiteboardPresencePayload): Promise<unknown>;
  untrack(): Promise<unknown>;
  send(message: {
    type: 'broadcast';
    event: string;
    payload: unknown;
  }): Promise<unknown>;
}

export interface SupabaseBroadcastLike {
  channel(
    name: string,
    opts: {
      config: {
        presence: { key: string };
        broadcast: { self: boolean };
        // Set for RLS-backed rooms (notepad, hearth whiteboards) so Supabase
        // enforces realtime.messages policies on the channel. Left unset for
        // the anonymous-by-design apps (standalone whiteboard, findme), which
        // stay public — Supabase only checks RLS on private channels.
        private?: boolean;
      };
    },
  ): BroadcastPresenceChannel;
  removeChannel(channel: BroadcastPresenceChannel): void;
  // Present on the real SupabaseClient; used to hand the connection the
  // signed-in JWT before joining a private channel, and to refresh it.
  realtime?: {
    setAuth(token?: string | null): void | Promise<unknown>;
  };
}
