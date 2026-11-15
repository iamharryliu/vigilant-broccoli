import { createParentSessionAuth } from '@vigilant-broccoli/react-lib-auth';
import type { GoogleTasksAuthAdapter } from '@vigilant-broccoli/react-lib-tasks';
import { getFrameAncestors } from './client-runtime-config';

const IS_DEV = process.env.NODE_ENV !== 'production';
// Mirrors the CSP's dev frame-ancestors in src/proxy.ts (any local port).
const DEV_PARENT_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedParentOrigin = (origin: string) =>
  getFrameAncestors().includes(origin) ||
  (IS_DEV && DEV_PARENT_ORIGIN.test(origin));

// /embed?session=parent: the embedding manager owns the session.
export const parentSessionTasksAuth: GoogleTasksAuthAdapter =
  createParentSessionAuth({ isAllowedParentOrigin });
