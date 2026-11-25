import { useState } from 'react';
import {
  Badge,
  CloseButton,
  IconButton,
  Input,
  SortSelect,
} from '@vigilant-broccoli/react-lib';
import {
  CheckListBase,
  KanbanBoard,
  KanbanCard,
  KanbanLane,
  KanbanMove,
} from '@vigilant-broccoli/react-lib-checklist';

type DemoCard = KanbanCard & { title: string; tag: string; checked: boolean };

const noop = () => undefined;

const SORT = { DEFAULT: 'default', TITLE: 'title' } as const;
type Sort = (typeof SORT)[keyof typeof SORT];
const SORT_OPTIONS: Sort[] = [SORT.DEFAULT, SORT.TITLE];
const SORT_LABELS: Record<Sort, string> = {
  [SORT.DEFAULT]: 'Default',
  [SORT.TITLE]: 'Title',
};

const SEED_LANES: KanbanLane[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const seedCards = (): DemoCard[] => [
  {
    id: 'c1',
    laneId: 'todo',
    title: 'Draft the launch post',
    tag: 'Writing',
    checked: false,
  },
  {
    id: 'c2',
    laneId: 'todo',
    title: 'Fix the login redirect',
    tag: 'Bug',
    checked: false,
  },
  {
    id: 'c3',
    laneId: 'doing',
    title: 'Design the settings page',
    tag: 'Design',
    checked: false,
  },
  {
    id: 'c4',
    laneId: 'done',
    title: 'Set up CI',
    tag: 'Infra',
    checked: false,
  },
];

const applyMove = (cards: DemoCard[], move: KanbanMove): DemoCard[] => {
  const moved = cards.find(card => card.id === move.cardId);
  if (!moved) return cards;
  const others = cards.filter(card => card.id !== move.cardId);
  const target = others.filter(card => card.laneId === move.toLaneId);
  // Same-lane `toIndex` counts the dragged card, so a downward drag lands after the card it dropped on.
  const index = Math.min(move.toIndex, target.length);
  const nextTarget = [
    ...target.slice(0, index),
    { ...moved, laneId: move.toLaneId },
    ...target.slice(index),
  ];
  return [
    ...others.filter(card => card.laneId !== move.toLaneId),
    ...nextTarget,
  ];
};

export const KanbanBoardDemo = () => {
  const [cards, setCards] = useState<DemoCard[]>(seedCards);
  const [lanes, setLanes] = useState(SEED_LANES);
  const [sorts, setSorts] = useState<Record<string, Sort>>({});
  const [searches, setSearches] = useState<Record<string, string | null>>({});

  const visibleCards = lanes.flatMap(lane => {
    const query = searches[lane.id]?.trim().toLowerCase() ?? '';
    const laneCards = cards.filter(
      card =>
        card.laneId === lane.id && card.title.toLowerCase().includes(query),
    );
    return sorts[lane.id] === SORT.TITLE
      ? [...laneCards].sort((a, b) => a.title.localeCompare(b.title))
      : laneCards;
  });

  // Moves index into what the lane shows, so apply them there and keep filtered-out cards at the end.
  const handleMove = (move: KanbanMove) =>
    setCards(prev => {
      const shown = new Set(visibleCards.map(card => card.id));
      return [
        ...applyMove(visibleCards, move),
        ...prev.filter(card => !shown.has(card.id)),
      ];
    });

  return (
    // The page column is max-w-4xl, narrower than three lanes plus Add Lane, which would hide the button behind a scroll. Lanes fill the height they are given and scroll inside it, so the board needs a bounded parent.
    <div className="h-[32rem] w-[calc(100vw-7rem)]">
      <KanbanBoard
        lanes={lanes}
        onReorderLanes={ids =>
          setLanes(prev =>
            ids.flatMap(id => prev.filter(lane => lane.id === id)),
          )
        }
        cards={visibleCards}
        onMoveCard={handleMove}
        cardVariant="row"
        onAddLane={() => {
          const id = `lane-${Date.now()}`;
          setLanes(prev => [...prev, { id, title: `Lane ${prev.length + 1}` }]);
        }}
        renderLaneActions={lane => (
          <>
            <IconButton
              variant="ghost"
              icon="search"
              aria-label="Search cards"
              onClick={() =>
                setSearches(prev => ({
                  ...prev,
                  [lane.id]:
                    prev[lane.id] === null || !(lane.id in prev) ? '' : null,
                }))
              }
            />
            <CloseButton
              onClick={() => {
                setLanes(prev => prev.filter(l => l.id !== lane.id));
                setCards(prev => prev.filter(card => card.laneId !== lane.id));
              }}
            />
          </>
        )}
        renderLaneToolbar={lane => (
          <div className="flex flex-col gap-2">
            {typeof searches[lane.id] === 'string' && (
              <Input
                value={searches[lane.id] ?? ''}
                onChange={e =>
                  setSearches(prev => ({ ...prev, [lane.id]: e.target.value }))
                }
                placeholder="Search cards..."
              />
            )}
            <div className="ml-auto">
              <SortSelect
                value={sorts[lane.id] ?? SORT.DEFAULT}
                onValueChange={value =>
                  setSorts(prev => ({ ...prev, [lane.id]: value }))
                }
                options={SORT_OPTIONS}
                labels={SORT_LABELS}
              />
            </div>
          </div>
        )}
        renderCard={card => (
          <CheckListBase
            items={[card]}
            storageKeyPrefix={`kanban-demo-${card.id}`}
            onToggleCheck={item =>
              setCards(prev =>
                prev.map(c =>
                  c.id === item.id ? { ...c, checked: !c.checked } : c,
                ),
              )
            }
            onStartEdit={noop}
            onEditChange={noop}
            onSaveEdit={noop}
            onCancelEdit={noop}
            renderItemMeta={() => (
              <Badge size="1" color="blue" variant="soft">
                {card.tag}
              </Badge>
            )}
          />
        )}
      />
    </div>
  );
};
