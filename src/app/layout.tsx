import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecyclingMonitor Foto-Box | Entdecke deine Superkraft",
  description:
    "Interaktive Foto-Box von RecyclingMonitor – Wähle deine Superkraft und erhalte ein KI-generiertes Foto!",
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
          href="https://fonts.bunny.net/css?family=source-sans-3:200,300,400,500,600,700,800,900"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-white">{children}</body>
    </html>
  );
}
