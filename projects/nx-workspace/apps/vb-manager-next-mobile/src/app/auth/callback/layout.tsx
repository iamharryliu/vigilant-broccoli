import { PAGE_TITLE } from '../../app.const';

export const metadata = {
  title: PAGE_TITLE.AUTH_CALLBACK,
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
