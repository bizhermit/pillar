import type { Metadata } from "next";
import "./root.scss";

export const metadata: Metadata = {
  title: "Next App Template",
  description: "next-app template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
