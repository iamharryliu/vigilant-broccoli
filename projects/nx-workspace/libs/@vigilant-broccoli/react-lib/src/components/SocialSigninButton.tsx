import { ReactNode } from 'react';

const SOCIAL_BUTTON_CLASS =
  'flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer';

export const SocialSigninButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button className={SOCIAL_BUTTON_CLASS} onClick={onClick}>
    {icon}
    {label}
  </button>
);

export const GoogleSigninButton = ({ onClick }: { onClick?: () => void }) => (
  <SocialSigninButton
    onClick={onClick}
    label="Sign in with Google"
    icon={
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.46 3.19 29.5 1 24 1 14.82 1 7.07 6.48 3.6 14.18l7.08 5.5C12.4 13.72 17.73 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.67c-.55 2.97-2.2 5.48-4.68 7.17l7.18 5.57C43.46 37.69 46.52 31.55 46.52 24.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.68 28.32A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.68-4.32l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.86.92 7.51 2.54 10.74l8.14-6.42z"
        />
        <path
          fill="#34A853"
          d="M24 47c5.5 0 10.12-1.82 13.49-4.93l-7.18-5.57C28.53 38.1 26.37 38.8 24 38.8c-6.27 0-11.6-4.22-13.32-9.98l-8.14 6.42C6.07 43.48 14.42 47 24 47z"
        />
      </svg>
    }
  />
);

export const MicrosoftSigninButton = ({
  onClick,
}: {
  onClick?: () => void;
}) => (
  <SocialSigninButton
    onClick={onClick}
    label="Sign in with Microsoft"
    icon={
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    }
  />
);
