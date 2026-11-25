import { useState } from 'react';
import {
  Badge,
  KanbanBoard,
  KanbanCard,
  KanbanLane,
  KanbanMove,
  Text,
} from '@vigilant-broccoli/react-lib';

type DemoCard = KanbanCard & { title: string; tag: string };

const LANES: KanbanLane[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const seedCards = (): DemoCard[] => [
  { id: 'c1', laneId: 'todo', title: 'Draft the launch post', tag: 'Writing' },
  { id: 'c2', laneId: 'todo', title: 'Fix the login redirect', tag: 'Bug' },
  {
    id: 'c3',
    laneId: 'doing',
    title: 'Design the settings page',
    tag: 'Design',
  },
  { id: 'c4', laneId: 'done', title: 'Set up CI', tag: 'Infra' },
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

  return (
    <KanbanBoard
      lanes={LANES}
      cards={cards}
      onMoveCard={move => setCards(prev => applyMove(prev, move))}
      renderCard={card => (
        <div className="flex flex-col items-start gap-2">
          <Text size="2">{card.title}</Text>
          <Badge size="1" color="blue" variant="soft">
            {card.tag}
          </Badge>
        </div>
      )}
    />
  );
};
