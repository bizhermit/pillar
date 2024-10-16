import { DEFAULT_LANG, LANG_KEY } from "@/i18n/consts";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { defaultLayoutTheme, LayoutProvider, LayoutTheme } from "../components/react/hooks/layout";
import "../components/styles/index.scss";

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
  height: "device-height",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = cookies();
  const lang = c.get(LANG_KEY)?.value.split(",")[0] || DEFAULT_LANG;
  const layoutTheme = (c.get("theme")?.value as LayoutTheme) || defaultLayoutTheme;
  return (
    <html
      lang={lang}
      data-theme={layoutTheme}
    >
      <body>
        <SessionProvider>
          <LayoutProvider defaultLayoutTheme={layoutTheme}>
            {children}
          </LayoutProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
