'use client';

import {
  PREVIEW_DEPLOYMENTS_LAYOUT,
  PreviewDeployments,
} from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../providers/auth-provider';

// A client boundary: the page exports metadata, so it can't pass authFetch.
export const PreviewDeploymentsView = () => (
  <PreviewDeployments
    authFetch={authFetch}
    layout={PREVIEW_DEPLOYMENTS_LAYOUT.STACK}
  />
);
