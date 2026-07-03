'use client';

import { useEffect, useState } from 'react';
import {
  CONNECTION_STATUS,
  useWhiteboardRoom,
} from '../hooks/useWhiteboardRoom';
import { useTranslation } from '../i18n';

const USER_PREFIX = 'user-';
const USER_ID_LENGTH = 6;
const USER_ID_STORAGE_KEY = 'whiteboard-user-id';
const USERNAME_STORAGE_KEY = 'whiteboard-username';
const ROOM_STORAGE_KEY = 'whiteboard-room';
const NAME_SEPARATOR = '-';
const RANDOMIZE_ICON = '🎲';
const SINGLE_MEMBER = 1;

const NAME_ADJECTIVES = [
  'swift',
  'brave',
  'sunny',
  'witty',
  'mellow',
  'cosmic',
  'fuzzy',
  'nimble',
  'jolly',
  'curious',
  'breezy',
  'lucky',
];

const NAME_NOUNS = [
  'otter',
  'falcon',
  'panda',
  'comet',
  'maple',
  'badger',
  'pixel',
  'walrus',
  'sparrow',
  'cactus',
  'dolphin',
  'gecko',
];

const randomItem = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomUsername = () =>
  `${randomItem(NAME_ADJECTIVES)}${NAME_SEPARATOR}${randomItem(NAME_NOUNS)}`;

const randomRoom = () =>
  `${randomItem(NAME_ADJECTIVES)}${NAME_SEPARATOR}${randomItem(NAME_NOUNS)}`;

const randomUserId = () =>
  `${USER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + USER_ID_LENGTH)}`;

const getOrCreate = (key: string, create: () => string) => {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = create();
  localStorage.setItem(key, value);
  return value;
};

export function WhiteboardApp() {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [roomDraft, setRoomDraft] = useState('');
  const [activeRoom, setActiveRoom] = useState('');

  useEffect(() => {
    setUserId(getOrCreate(USER_ID_STORAGE_KEY, randomUserId));
    setUsername(getOrCreate(USERNAME_STORAGE_KEY, randomUsername));
    setRoomDraft(localStorage.getItem(ROOM_STORAGE_KEY) ?? '');
  }, []);

  const updateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
  };

  const joinRoom = () => {
    const room = roomDraft.trim();
    if (!room) return;
    localStorage.setItem(ROOM_STORAGE_KEY, room);
    setActiveRoom(room);
  };

  const leaveRoom = () => {
    setActiveRoom('');
  };

  const { content, setContent, members, connectionStatus } = useWhiteboardRoom(
    activeRoom,
    userId,
    username,
  );

  const membersLabel =
    members.length <= SINGLE_MEMBER
      ? t('MEMBERS.COUNT_ONE')
      : t('MEMBERS.COUNT_MANY', { count: members.length });

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <header className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">
          {t('APP.TITLE')}
        </h1>
        <p className="text-sm text-gray-500">{t('APP.SUBTITLE')}</p>
      </header>

      <div className="px-4 py-3 flex flex-col gap-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 shrink-0">
            {t('USER.YOU_FIELD')}
          </span>
          <input
            type="text"
            value={username}
            placeholder={t('USER.USERNAME_PLACEHOLDER')}
            onChange={e => updateUsername(e.target.value)}
            className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            aria-label={t('USER.RANDOMIZE')}
            title={t('USER.RANDOMIZE')}
            onClick={() => updateUsername(randomUsername())}
            className="shrink-0 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
          >
            {RANDOMIZE_ICON}
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 shrink-0">
            {t('ROOM.LABEL')}
          </span>
          <input
            type="text"
            value={roomDraft}
            placeholder={t('ROOM.PLACEHOLDER')}
            onChange={e => setRoomDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') joinRoom();
            }}
            disabled={Boolean(activeRoom)}
            className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="button"
            aria-label={t('ROOM.RANDOMIZE')}
            title={t('ROOM.RANDOMIZE')}
            onClick={() => setRoomDraft(randomRoom())}
            disabled={Boolean(activeRoom)}
            className="shrink-0 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {RANDOMIZE_ICON}
          </button>
          {activeRoom ? (
            <button
              type="button"
              onClick={leaveRoom}
              className="shrink-0 rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
            >
              {t('ROOM.LEAVE')}
            </button>
          ) : (
            <button
              type="button"
              onClick={joinRoom}
              disabled={!roomDraft.trim()}
              className="shrink-0 rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {t('ROOM.JOIN')}
            </button>
          )}
        </div>
      </div>

      {!activeRoom ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-gray-400">
          {t('ROOM.EMPTY_STATE')}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 p-4 min-h-0">
          {connectionStatus === CONNECTION_STATUS.ERROR && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {t('CONNECTION.ERROR')}
            </div>
          )}
          {connectionStatus === CONNECTION_STATUS.CONNECTING && (
            <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
              {t('CONNECTION.CONNECTING')}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              {t('BOARD.TITLE')}
            </span>
            <span className="text-gray-500">{membersLabel}</span>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('BOARD.PLACEHOLDER')}
            disabled={connectionStatus !== CONNECTION_STATUS.CONNECTED}
            className="flex-1 min-h-0 w-full resize-none rounded border border-gray-300 p-3 font-mono text-sm leading-relaxed text-gray-800 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          />

          <p className="text-xs text-gray-400">{t('ROOM.SHARE_HINT')}</p>

          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            <span className="text-xs font-medium text-gray-500">
              {t('MEMBERS.TITLE')}
            </span>
            {members.map(member => (
              <div
                key={member.userId}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>
                  {member.userId === userId
                    ? t('USER.YOU_LABEL')
                    : member.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
