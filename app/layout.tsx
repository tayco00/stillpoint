import type { Viewport } from "next";
import { headers } from "next/headers";
import globals from "./globals.css?raw";

const TITLE = "Stillpoint — Fokus, der sich gut anfühlt";
const DESCRIPTION =
  "Ein kostenloser Fokus-Workspace mit Timer, Atempausen und Tagesfortschritt. Ruhig, privat und ohne Anmeldung.";

export const viewport: Viewport = {
  themeColor: "#f1f0e8",
  colorScheme: "light",
};

async function requestBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return new URL(`${protocol}://${host}`);
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const baseUrl = await requestBaseUrl();
  const socialImage = new URL("/og.png", baseUrl).href;

  return (
    <html lang="de">
      <head>
        <style dangerouslySetInnerHTML={{ __html: globals }} />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="application-name" content="Stillpoint" />
        <meta name="keywords" content="Fokus Timer, Pomodoro, Produktivität, Atemübung, Deep Work" />
        <meta name="author" content="Stillpoint" />
        <meta name="creator" content="Stillpoint" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={baseUrl.href} />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:url" content={baseUrl.href} />
        <meta property="og:site_name" content="Stillpoint" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:width" content="1731" />
        <meta property="og:image:height" content="909" />
        <meta property="og:image:alt" content="Stillpoint Fokusraum mit 25-Minuten-Timer" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content="Stillpoint Fokusraum mit 25-Minuten-Timer" />
      </head>
      <body>{children}</body>
    </html>
  );
}
