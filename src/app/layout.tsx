import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecyclingMonitor Foto-Box | Entdecke deine Superkraft",
  description:
    "Interaktive Foto-Box von RecyclingMonitor — Wähle deine Superkraft und erhalte ein KI-generiertes Foto!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.bunny.net"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.bunny.net/css?family=source-sans-3:200,300,400,500,600,700,800,900|dm-mono:400,500"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="antialiased min-h-screen bg-pb-black text-pb-sand">
        {children}
      </body>
    </html>
  );
}
