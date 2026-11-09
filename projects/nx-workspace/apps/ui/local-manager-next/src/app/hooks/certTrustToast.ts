import { toast } from '@vigilant-broccoli/react-lib/toaster';

const TOAST_ID = 'socket-cert-trust';
const TOAST_TITLE = 'Cannot reach realtime server';
const TOAST_DESCRIPTION =
  'The server uses a self-signed certificate your browser does not trust. Open it in a new tab, accept the warning, then return here.';
const TOAST_ACTION_LABEL = 'Trust certificate';
const WINDOW_TARGET_BLANK = '_blank';

export const showCertTrustToast = (url: string) => {
  toast.error(TOAST_TITLE, {
    id: TOAST_ID,
    description: TOAST_DESCRIPTION,
    duration: Infinity,
    action: {
      label: TOAST_ACTION_LABEL,
      onClick: () => window.open(url, WINDOW_TARGET_BLANK),
    },
  });
};

export const dismissCertTrustToast = () => toast.dismiss(TOAST_ID);
