'use client';

import { PREVIEW_DEPLOYMENTS_API_PATH } from '@vigilant-broccoli/github-workspace-js';
import {
  PREVIEW_DEPLOYMENTS_LAYOUT,
  PreviewDeployments,
} from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../providers/auth-provider';

const loadPreviewDeployments = async () =>
  (await authFetch(PREVIEW_DEPLOYMENTS_API_PATH)).json();

// A client boundary: the page exports metadata, so it can't pass authFetch.
export const PreviewDeploymentsView = () => (
  <PreviewDeployments
    loadPreviewDeployments={loadPreviewDeployments}
    layout={PREVIEW_DEPLOYMENTS_LAYOUT.STACK}
  />
);
