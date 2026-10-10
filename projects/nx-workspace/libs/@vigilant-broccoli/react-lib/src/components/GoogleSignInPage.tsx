import { ReactNode } from 'react';
import { GoogleSigninButton } from './SocialSigninButton';

export interface GoogleSignInPageProps {
  appName: ReactNode;
  tagline?: ReactNode;
  onSignIn: () => void | Promise<void>;
}

export const GoogleSignInPage = ({
  appName,
  tagline,
  onSignIn,
}: GoogleSignInPageProps) => (
  <main className="min-h-dvh flex items-center justify-center bg-muted">
    <div className="w-full max-w-sm mx-4 rounded-2xl bg-background p-8 shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{appName}</h1>
        {tagline && <p className="text-sm text-muted-foreground">{tagline}</p>}
      </div>
      <GoogleSigninButton onClick={onSignIn} />
    </div>
  </main>
);
