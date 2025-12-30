import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

export const metadata = {
  title: "CMS Next",
  description: "Simple CMS built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
