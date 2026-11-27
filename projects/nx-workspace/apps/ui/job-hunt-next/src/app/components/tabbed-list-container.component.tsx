'use client';

import { ReactNode, useState } from 'react';
import { Settings as SettingsIcon, Trash2 } from 'lucide-react';
import {
  Button,
  DangerCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';

export const SETTINGS_VIEW = 'settings';

export type ContainerTab = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
};

type ClearAll = {
  title: string;
  description: string;
  actionLabel: string;
  confirmTitle: string;
  cancelLabel: string;
  disabled?: boolean;
  // The container closes its confirmation first, so this only does the clear.
  onConfirm: () => void;
};

type TabbedListContainerProps = {
  // The list views; the Settings tab is always appended after them.
  tabs: ContainerTab[];
  view: string;
  onViewChange: (view: string) => void;
  settingsLabel: string;
  // False renders the children alone, for a list too empty to need tabs.
  showTabs?: boolean;
  // Right of the tabs and hidden on the Settings tab.
  toolbar?: ReactNode;
  clearAll: ClearAll;
  children: ReactNode;
};

// The shared frame of the Matches and Applications pages: a tab strip that ends
// in Settings, a toolbar beside it, the list below, and on Settings a danger
// card whose clear-all action asks for confirmation first.
export const TabbedListContainer = ({
  tabs,
  view,
  onViewChange,
  settingsLabel,
  showTabs = true,
  toolbar,
  clearAll,
  children,
}: TabbedListContainerProps) => {
  const [confirming, setConfirming] = useState(false);
  const isSettings = showTabs && view === SETTINGS_VIEW;

  return (
    <>
      {showTabs && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={view} onValueChange={onViewChange}>
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
              <TabsTrigger value={SETTINGS_VIEW} className="gap-1.5">
                <SettingsIcon size={14} />
                {settingsLabel}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {!isSettings && toolbar}
        </div>
      )}
      {isSettings ? (
        <DangerCard
          className="shrink-0"
          title={clearAll.title}
          description={clearAll.description}
          actionLabel={clearAll.actionLabel}
          actionIcon={<Trash2 />}
          actionDisabled={clearAll.disabled}
          onAction={() => setConfirming(true)}
        />
      ) : (
        children
      )}
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{clearAll.confirmTitle}</DialogTitle>
            <DialogDescription>{clearAll.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              {clearAll.cancelLabel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirming(false);
                clearAll.onConfirm();
              }}
            >
              <Trash2 />
              {clearAll.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
