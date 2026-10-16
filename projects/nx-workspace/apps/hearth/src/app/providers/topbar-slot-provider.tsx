'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const USE_TOPBAR_SLOT_ERROR =
  'useTopbarSlotContext must be used within a TopbarSlotProvider';

type TopbarSlotContextType = {
  slotNode: HTMLDivElement | null;
  setSlotNode: (node: HTMLDivElement | null) => void;
};

const TopbarSlotContext = createContext<TopbarSlotContextType | undefined>(
  undefined,
);

export function TopbarSlotProvider({ children }: { children: ReactNode }) {
  const [slotNode, setSlotNode] = useState<HTMLDivElement | null>(null);

  return (
    <TopbarSlotContext.Provider value={{ slotNode, setSlotNode }}>
      {children}
    </TopbarSlotContext.Provider>
  );
}

function useTopbarSlotContext() {
  const context = useContext(TopbarSlotContext);
  if (context === undefined) {
    throw new Error(USE_TOPBAR_SLOT_ERROR);
  }
  return context;
}

export function useTopbarSlotNode() {
  return useTopbarSlotContext().setSlotNode;
}

export function TopbarSlot({ children }: { children: ReactNode }) {
  const { slotNode } = useTopbarSlotContext();
  if (!slotNode) return null;
  return createPortal(children, slotNode);
}
