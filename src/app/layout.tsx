import type { Metadata, Viewport } from "next";
import "./globals.css";


export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "KnowIt!",
  description: "Deviens un pro du Trivial Pursuit",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KnowIt!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
