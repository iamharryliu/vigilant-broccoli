'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@vigilant-broccoli/react-lib';
import { closingTick, SUDDEN_DEATH_ORDER } from '../engine/board';
import {
  BALLOON_FUSE_TICKS,
  BOARD_COLUMNS,
  BOARD_ROWS,
  CELL,
  DIRECTION_VECTORS,
  SUDDEN_DEATH_WARNING_TICKS,
} from '../engine/game.consts';
import { MatchState, Player } from '../engine/game.types';
import {
  PLAYER_COLORS,
  POWER_UP_COLORS,
  POWER_UP_GLYPHS,
} from './game-visuals.consts';

const PALETTE = {
  light: {
    floor: ['#dcf5d3', '#cfeec4'],
    wall: '#64748b',
    wallTop: '#94a3b8',
    crate: '#d39a5c',
    crateEdge: '#8b5a2b',
    splash: 'rgba(14, 165, 233, 0.7)',
    splashCore: 'rgba(224, 242, 254, 0.9)',
    warning: 'rgba(239, 68, 68, 0.35)',
    outline: '#0f172a',
    label: '#0f172a',
    powerUp: 'rgba(255, 255, 255, 0.85)',
  },
  dark: {
    floor: ['#1d3a2b', '#193326'],
    wall: '#334155',
    wallTop: '#475569',
    crate: '#9a6634',
    crateEdge: '#5c3a1a',
    splash: 'rgba(56, 189, 248, 0.6)',
    splashCore: 'rgba(186, 230, 253, 0.8)',
    warning: 'rgba(248, 113, 113, 0.35)',
    outline: '#020617',
    label: '#f8fafc',
    powerUp: 'rgba(15, 23, 42, 0.75)',
  },
} as const;

const EASE_PER_SECOND = 18;
const SNAP_DISTANCE = 1.5;
const MS_PER_SECOND = 1000;
const FONT_FAMILY = 'system-ui, sans-serif';

type Palette = (typeof PALETTE)[keyof typeof PALETTE];
type Position = { x: number; y: number };

const targetPosition = (player: Player): Position => ({
  x: player.fromX + (player.x - player.fromX) * player.progress,
  y: player.fromY + (player.y - player.fromY) * player.progress,
});

const drawBoard = (
  context: CanvasRenderingContext2D,
  match: MatchState,
  tile: number,
  palette: Palette,
) => {
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLUMNS; x++) {
      const cell = match.cells[y * BOARD_COLUMNS + x];
      const left = x * tile;
      const top = y * tile;
      context.fillStyle = palette.floor[(x + y) % 2];
      context.fillRect(left, top, tile, tile);
      if (cell === CELL.WALL) {
        context.fillStyle = palette.wall;
        context.fillRect(left, top, tile, tile);
        context.fillStyle = palette.wallTop;
        context.fillRect(left, top, tile, tile * 0.78);
      }
      if (cell === CELL.CRATE) {
        const inset = tile * 0.06;
        context.fillStyle = palette.crateEdge;
        context.fillRect(
          left + inset,
          top + inset,
          tile - inset * 2,
          tile - inset * 2,
        );
        context.fillStyle = palette.crate;
        const plank = tile * 0.14;
        context.fillRect(
          left + plank,
          top + plank,
          tile - plank * 2,
          tile - plank * 2,
        );
        context.strokeStyle = palette.crateEdge;
        context.lineWidth = Math.max(1, tile * 0.05);
        context.beginPath();
        context.moveTo(left + plank, top + plank);
        context.lineTo(left + tile - plank, top + tile - plank);
        context.stroke();
      }
    }
  }
};

const drawWarnings = (
  context: CanvasRenderingContext2D,
  match: MatchState,
  tile: number,
  palette: Palette,
) => {
  context.fillStyle = palette.warning;
  SUDDEN_DEATH_ORDER.forEach((point, index) => {
    const ticksLeft = closingTick(index) - match.tick;
    if (ticksLeft <= 0 || ticksLeft > SUDDEN_DEATH_WARNING_TICKS) return;
    context.fillRect(point.x * tile, point.y * tile, tile, tile);
  });
};

const drawSplashes = (
  context: CanvasRenderingContext2D,
  match: MatchState,
  tile: number,
  palette: Palette,
) => {
  match.splashes.forEach(splash => {
    const inset = tile * 0.08;
    context.fillStyle = palette.splash;
    context.fillRect(
      splash.x * tile + inset,
      splash.y * tile + inset,
      tile - inset * 2,
      tile - inset * 2,
    );
    context.fillStyle = palette.splashCore;
    context.beginPath();
    context.arc(
      (splash.x + 0.5) * tile,
      (splash.y + 0.5) * tile,
      tile * 0.18,
      0,
      Math.PI * 2,
    );
    context.fill();
  });
};

const drawPowerUps = (
  context: CanvasRenderingContext2D,
  match: MatchState,
  tile: number,
  palette: Palette,
) => {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `${Math.floor(tile * 0.55)}px ${FONT_FAMILY}`;
  match.powerUps.forEach(powerUp => {
    const centerX = (powerUp.x + 0.5) * tile;
    const centerY = (powerUp.y + 0.5) * tile;
    context.fillStyle = POWER_UP_COLORS[powerUp.type];
    context.beginPath();
    context.arc(centerX, centerY, tile * 0.38, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = palette.powerUp;
    context.beginPath();
    context.arc(centerX, centerY, tile * 0.3, 0, Math.PI * 2);
    context.fill();
    context.fillText(POWER_UP_GLYPHS[powerUp.type], centerX, centerY);
  });
};

const drawBalloons = (
  context: CanvasRenderingContext2D,
  match: MatchState,
  tile: number,
  palette: Palette,
  now: number,
) => {
  match.balloons.forEach(balloon => {
    const owner = match.players.find(player => player.id === balloon.ownerId);
    const urgency = 1 - balloon.fuse / BALLOON_FUSE_TICKS;
    const wobble =
      1 + Math.sin(now / (160 - urgency * 110)) * 0.06 * (1 + urgency);
    const radius = tile * 0.34 * wobble;
    const centerX = (balloon.x + 0.5) * tile;
    const centerY = (balloon.y + 0.47) * tile;
    context.fillStyle = PLAYER_COLORS[owner?.slot ?? 0];
    context.strokeStyle = palette.outline;
    context.lineWidth = Math.max(1, tile * 0.04);
    context.beginPath();
    context.ellipse(centerX, centerY, radius * 0.9, radius, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(centerX, centerY + radius);
    context.lineTo(centerX - tile * 0.05, centerY + radius + tile * 0.08);
    context.lineTo(centerX + tile * 0.05, centerY + radius + tile * 0.08);
    context.closePath();
    context.fill();
    context.fillStyle = 'rgba(255, 255, 255, 0.55)';
    context.beginPath();
    context.ellipse(
      centerX - radius * 0.35,
      centerY - radius * 0.4,
      radius * 0.18,
      radius * 0.28,
      -0.5,
      0,
      Math.PI * 2,
    );
    context.fill();
  });
};

const drawPlayer = (
  context: CanvasRenderingContext2D,
  player: Player,
  position: Position,
  tile: number,
  palette: Palette,
  isLocal: boolean,
) => {
  const centerX = (position.x + 0.5) * tile;
  const centerY = (position.y + 0.5) * tile;
  const radius = tile * 0.36;
  const look = DIRECTION_VECTORS[player.facing];

  if (isLocal) {
    context.strokeStyle = palette.label;
    context.lineWidth = Math.max(1, tile * 0.05);
    context.setLineDash([tile * 0.1, tile * 0.08]);
    context.beginPath();
    context.arc(centerX, centerY, radius + tile * 0.08, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  context.fillStyle = PLAYER_COLORS[player.slot];
  context.strokeStyle = palette.outline;
  context.lineWidth = Math.max(1, tile * 0.05);
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  [-1, 1].forEach(side => {
    const eyeX = centerX + side * radius * 0.38 + look.x * radius * 0.25;
    const eyeY = centerY - radius * 0.15 + look.y * radius * 0.25;
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(eyeX, eyeY, radius * 0.24, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#0f172a';
    context.beginPath();
    context.arc(
      eyeX + look.x * radius * 0.1,
      eyeY + look.y * radius * 0.1,
      radius * 0.11,
      0,
      Math.PI * 2,
    );
    context.fill();
  });

  context.fillStyle = palette.label;
  context.textAlign = 'center';
  context.textBaseline = 'bottom';
  context.font = `600 ${Math.max(9, Math.floor(tile * 0.26))}px ${FONT_FAMILY}`;
  context.fillText(player.name, centerX, centerY - radius - tile * 0.04);
};

export function GameBoard({
  match,
  localPlayerId,
  label,
}: {
  match: MatchState;
  localPlayerId: string;
  label: string;
}) {
  const { appearance } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const matchRef = useRef(match);
  matchRef.current = match;
  const positionsRef = useRef(new Map<string, Position>());

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const palette = PALETTE[appearance];
    let frame = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / MS_PER_SECOND;
      lastTime = now;
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const tile = (width / BOARD_COLUMNS) * ratio;
      const pixelWidth = Math.round(tile * BOARD_COLUMNS);
      const pixelHeight = Math.round(tile * BOARD_ROWS);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const current = matchRef.current;
      drawBoard(context, current, tile, palette);
      drawWarnings(context, current, tile, palette);
      drawSplashes(context, current, tile, palette);
      drawPowerUps(context, current, tile, palette);

      const ease = Math.min(1, delta * EASE_PER_SECOND);
      current.players
        .filter(player => player.alive)
        .forEach(player => {
          const target = targetPosition(player);
          const shown = positionsRef.current.get(player.id) ?? target;
          const far =
            Math.abs(shown.x - target.x) + Math.abs(shown.y - target.y) >
            SNAP_DISTANCE;
          const next = far
            ? target
            : {
                x: shown.x + (target.x - shown.x) * ease,
                y: shown.y + (target.y - shown.y) * ease,
              };
          positionsRef.current.set(player.id, next);
          drawPlayer(
            context,
            player,
            next,
            tile,
            palette,
            player.id === localPlayerId,
          );
        });
      // Balloons go over players so a freshly dropped one is visible under
      // the player who is still standing on it.
      drawBalloons(context, current, tile, palette, now);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [appearance, localPlayerId]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block w-full rounded-lg shadow-md"
      style={{ aspectRatio: `${BOARD_COLUMNS} / ${BOARD_ROWS}` }}
    />
  );
}
