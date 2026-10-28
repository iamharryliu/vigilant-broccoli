'use client';

import { createContext, useContext } from 'react';
import { DeployPayload } from '@vigilant-broccoli/deployment';

export const NotificationContext = createContext<
  (payload: DeployPayload) => void
  // eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const useAddNotification = () => useContext(NotificationContext);
