import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.LOGIN,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
