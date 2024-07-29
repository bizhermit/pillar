import type { Metadata, Viewport } from "next";
import "../components/styles/elements/root.scss";
// root.css is require first
import { cookies } from "next/headers";
import { defaultLayoutTheme, LayoutProvider, LayoutTheme } from "../components/react/hooks/layout";
import "../components/styles/elements/button.css";
import "../components/styles/elements/dialog.css";
import "../components/styles/elements/form-item.css";
import "../components/styles/elements/icon.css";

export const metadata: Metadata = {
  title: "Next App Template",
  description: "next-app template",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: "none",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutTheme = (cookies().get("theme")?.value as LayoutTheme) || defaultLayoutTheme;
  return (
    <html
      lang="ja"
      data-theme={layoutTheme}
    >
      <body>
        <LayoutProvider defaultLayoutTheme={layoutTheme}>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
