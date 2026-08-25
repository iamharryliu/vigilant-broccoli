'use client';

import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib';
import {
  authFetch,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
} from '../providers/auth-provider';

export const GoogleTasksView = () => (
  <GoogleTasksComponent
    auth={{ authFetch, useAuthStatus, useGoogleToken, signInWithGoogle }}
    showSelector
    enableDragDrop
    wrapInCard={false}
  />
);
