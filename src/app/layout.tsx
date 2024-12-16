import { LANG_KEY } from "@/i18n/consts";
import { LangProvider } from "@/i18n/react-hook";
import { parseLangs } from "@/i18n/utilities";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { defaultLayoutTheme, LAYOUT_THEME_KEY, LayoutProvider, LayoutTheme } from "../components/react/hooks/layout";
import "../components/styles/index.scss";

export const metadata: Metadata = {
  title: "NextApp Template",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langs = parseLangs(cookieStore.get(LANG_KEY)?.value);
  const layoutTheme = (cookieStore.get(LAYOUT_THEME_KEY)?.value as LayoutTheme) || defaultLayoutTheme;

  return (
    <html
      lang={langs[0]}
      data-theme={layoutTheme}
      data-mode={process.env.APP_MODE || undefined}
    >
      <body>
        <SessionProvider>
          <LangProvider langs={langs}>
            <LayoutProvider defaultLayoutTheme={layoutTheme}>
              {children}
            </LayoutProvider>
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
