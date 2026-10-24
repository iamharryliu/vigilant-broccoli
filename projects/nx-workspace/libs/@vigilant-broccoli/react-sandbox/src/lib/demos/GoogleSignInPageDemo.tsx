import { GoogleSignInPage } from '@vigilant-broccoli/react-lib-auth';
import { useState } from 'react';

const SIGN_IN_STUB_MESSAGE = 'Sign-in handler called (stubbed, no auth).';

// GoogleSignInPage fills the viewport (min-h-dvh), so it is framed in a
// transformed box that confines it to the frame.
export const GoogleSignInPageDemo = () => {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="h-96 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 [transform:translateZ(0)] [&_main]:min-h-full [&_main]:h-full">
        <GoogleSignInPage
          appName="Sample App"
          tagline="Sign in to continue"
          onSignIn={() => setMessage(SIGN_IN_STUB_MESSAGE)}
        />
      </div>
      <p className="text-sm text-gray-500">{message ?? 'Click the button'}</p>
    </div>
  );
};
