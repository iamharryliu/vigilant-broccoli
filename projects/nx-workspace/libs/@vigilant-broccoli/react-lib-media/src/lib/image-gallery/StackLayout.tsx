import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shouldIgnoreShortcutKeystroke } from '@vigilant-broccoli/react-lib';
import { type ImageGalleryItem, pickById } from './image-gallery.consts';
import { ImageGalleryImage, ImageGalleryTile } from './ImageGalleryTile';

export type StackLayoutLabels = { previous: string; next: string };

export const DEFAULT_STACK_LABELS: StackLayoutLabels = {
  previous: 'Previous image',
  next: 'Next image',
};

const KEY_PREVIOUS = 'ArrowLeft';
const KEY_NEXT = 'ArrowRight';
const EVENT_KEYDOWN = 'keydown';
// Only the top few cards are drawn; deeper ones would be hidden anyway.
const VISIBLE_DEPTH = 6;
const ICON_SIZE = 18;
// Each card keeps its own tilt and offset (salted so they vary independently),
// so the pile looks shuffled but a card lands the same way every time.
const TILTS_DEG = [-9, -6, -3, -1, 2, 4, 7, 10];
const OFFSETS_REM = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25];

const TOP_TRANSFORM = 'translate(-50%, -50%) rotate(0deg)';
const BACK_Z_INDEX = 0;
// Above every resting card, so the moving card passes over the pile.
const MOVING_Z_INDEX = VISIBLE_DEPTH + 1;
// How far a card swings out beside the pile while changing places.
const SWING_OUT_TRANSFORM = {
  NEXT: 'translate(15%, -55%) rotate(14deg)',
  PREVIOUS: 'translate(-115%, -55%) rotate(-14deg)',
};
const MOVE_DURATION_MS = 500;
const MOVE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
// The card swaps layers here, while it is clear of the pile.
const LAYER_SWAP_OFFSET = 0.5;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const restingTransform = (id: string, depth: number) =>
  depth === 0
    ? TOP_TRANSFORM
    : `translate(calc(-50% + ${pickById(id, OFFSETS_REM, 3)}rem), calc(-50% + ${pickById(id, OFFSETS_REM, 5)}rem)) rotate(${pickById(id, TILTS_DEG, 7)}deg)`;

const cardStyle = (id: string, depth: number): CSSProperties => ({
  zIndex: VISIBLE_DEPTH - depth,
  opacity: depth < VISIBLE_DEPTH ? 1 : 0,
  transform: restingTransform(id, depth),
});

type Move = { id: string; delta: number; toDepth: number };

// Next: the top card swings out right over the pile, drops behind it at the
// midpoint and tucks in at the back. Previous: the back card swings out left
// from behind, jumps in front at the midpoint and lands on top.
const moveKeyframes = ({ id, delta, toDepth }: Move): Keyframe[] => {
  const isNext = delta > 0;
  const swing = isNext
    ? SWING_OUT_TRANSFORM.NEXT
    : SWING_OUT_TRANSFORM.PREVIOUS;
  const fromDepth = isNext ? 0 : VISIBLE_DEPTH - 1;
  const before = isNext ? MOVING_Z_INDEX : BACK_Z_INDEX;
  const after = isNext ? BACK_Z_INDEX : MOVING_Z_INDEX;
  return [
    { transform: restingTransform(id, fromDepth), zIndex: before, opacity: 1 },
    { transform: swing, zIndex: before, offset: LAYER_SWAP_OFFSET },
    { transform: swing, zIndex: after, offset: LAYER_SWAP_OFFSET + 0.001 },
    {
      transform: restingTransform(id, toDepth),
      zIndex: after,
      opacity: toDepth < VISIBLE_DEPTH ? 1 : 0,
    },
  ];
};

const STEP_BUTTON_CLASS =
  'rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm transition hover:text-foreground disabled:opacity-40';

// A shuffled pile: the current image sits straight on top and the rest fan
// out beneath it. ← / → (ignored while typing or with a dialog open) or the
// buttons cycle; clicking the top image runs its call to action.
export const StackLayout = ({
  items,
  labels = DEFAULT_STACK_LABELS,
}: {
  items: ImageGalleryItem[];
  labels?: StackLayoutLabels;
}) => {
  const [current, setCurrent] = useState(0);
  const count = items.length;
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const pendingMove = useRef<Move | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (count < 2) return;
      const next = (current + delta + count) % count;
      // Next sends the old top card to the back; previous brings the new top
      // card forward from the back.
      const moving = delta > 0 ? items[current] : items[next];
      pendingMove.current = {
        id: moving.id,
        delta,
        toDepth: delta > 0 ? count - 1 : 0,
      };
      setCurrent(next);
    },
    [count, current, items],
  );

  // Runs after the new resting styles are applied, so the animation's last
  // frame matches where the card stays once it ends.
  useLayoutEffect(() => {
    const move = pendingMove.current;
    pendingMove.current = null;
    if (!move || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    cardRefs.current.get(move.id)?.animate(moveKeyframes(move), {
      duration: MOVE_DURATION_MS,
      easing: MOVE_EASING,
    });
  }, [current]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcutKeystroke(event)) return;
      if (event.key !== KEY_PREVIOUS && event.key !== KEY_NEXT) return;
      event.preventDefault();
      step(event.key === KEY_NEXT ? 1 : -1);
    };
    window.addEventListener(EVENT_KEYDOWN, onKeyDown);
    return () => window.removeEventListener(EVENT_KEYDOWN, onKeyDown);
  }, [step]);

  if (count === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <ul className="relative h-[26rem] w-full sm:h-[32rem]">
        {items.map((item, index) => {
          const depth = (index - current + count) % count;
          return (
            <li
              key={item.id}
              ref={element => {
                if (element) cardRefs.current.set(item.id, element);
                else cardRefs.current.delete(item.id);
              }}
              // Cards under the top one can't be clicked, focused or read out.
              inert={depth !== 0}
              style={cardStyle(item.id, depth)}
              className="absolute left-1/2 top-1/2 transition-[transform,opacity] duration-300 ease-out"
            >
              {/* The card shrinks to the image, so no letterbox shows around
                  it; the shadow alone separates cards in the pile. */}
              <ImageGalleryTile
                item={item}
                className="overflow-hidden rounded-lg shadow-xl"
              >
                <ImageGalleryImage
                  src={item.imageUrl}
                  className="h-auto max-h-[22rem] w-auto max-w-[16rem] sm:max-h-[28rem] sm:max-w-[22rem]"
                />
              </ImageGalleryTile>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={count < 2}
          aria-label={labels.previous}
          className={STEP_BUTTON_CLASS}
        >
          <ChevronLeft size={ICON_SIZE} />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={count < 2}
          aria-label={labels.next}
          className={STEP_BUTTON_CLASS}
        >
          <ChevronRight size={ICON_SIZE} />
        </button>
      </div>
    </div>
  );
};
