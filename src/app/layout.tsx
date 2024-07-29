import type { Metadata } from "next";
import "../components/styles/elements/root.css";
// root.css is require first
import "../components/styles/elements/button.css";
import "../components/styles/elements/dialog.css";
import "../components/styles/elements/form-item.css";
import "../components/styles/elements/icon.css";

export const metadata: Metadata = {
  title: "Next App Template",
  description: "next-app template",
  viewport: "width=device-width,initial-scale=1,maximum-scale=1.0",
  robots: "none",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <link rel="icon" type="image/x-icon" sizes="32x32" href="/favicons/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
