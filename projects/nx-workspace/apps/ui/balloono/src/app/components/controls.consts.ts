import { DIRECTION } from '../engine/game.consts';
import {
  ControlAction,
  DROP_ACTION,
  KEY_PLAYER,
  KeyPlayer,
} from '../hooks/useKeyBindings';

export const CONTROL_ACTION_LABEL_KEY = {
  [DIRECTION.UP]: 'CONTROLS.UP',
  [DIRECTION.DOWN]: 'CONTROLS.DOWN',
  [DIRECTION.LEFT]: 'CONTROLS.LEFT',
  [DIRECTION.RIGHT]: 'CONTROLS.RIGHT',
  [DROP_ACTION]: 'CONTROLS.DROP',
} as const satisfies Record<ControlAction, string>;

export const KEY_PLAYER_LABEL_KEY = {
  [KEY_PLAYER.ONE]: 'CONTROLS.PLAYER_ONE',
  [KEY_PLAYER.TWO]: 'CONTROLS.PLAYER_TWO',
} as const satisfies Record<KeyPlayer, string>;
