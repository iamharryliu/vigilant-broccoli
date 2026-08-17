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
      config: { presence: { key: string }; broadcast: { self: boolean } };
    },
  ): BroadcastPresenceChannel;
  removeChannel(channel: BroadcastPresenceChannel): void;
}
