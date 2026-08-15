import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Stillpoint product surface", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="de"/i);
  assert.match(html, /<title>Stillpoint — Fokus, der sich gut anfühlt<\/title>/i);
  assert.match(html, /Weniger/);
  assert.match(html, /Fokusraum/);
  assert.match(html, /Einmal Luft holen/);
  assert.match(html, /Wie viel ist heute da/);
  assert.match(html, /Nicht jetzt\. Nicht weg/);
  assert.match(html, /Fortschritt/);
  assert.doesNotMatch(html, /Ein ruhiger Ort für wichtige Arbeit/);
  assert.doesNotMatch(html, /Keine Anmeldung · Deine Daten bleiben auf diesem Gerät/);
  assert.doesNotMatch(html, /Mach nur das\. Für jetzt\./);
  assert.doesNotMatch(html, /Kleine Werkzeuge/);
  assert.doesNotMatch(html, /02 \/ RESET|03 \/ ENERGIE|04 \/ PARKPLATZ/);
  assert.doesNotMatch(html, /<span>05<\/span>\s*Dein Rhythmus/);
  assert.doesNotMatch(html, /Der nächste gute Schritt/);
  assert.equal((html.match(/class="marquee-group"/g) ?? []).length, 2);
  assert.match(html, /application\/ld\+json/);
});

test("ships finished metadata without starter residue", async () => {
  const html = await (await render()).text();
  assert.match(html, /name="description" content="Ein kostenloser Fokus-Workspace/);
  assert.match(html, /rel="canonical" href="http:\/\/localhost(?::3000)?\/?"/);
  assert.match(html, /property="og:locale" content="de_DE"/);
  assert.match(html, /name="theme-color" content="#f1f0e8"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview|react-loading-skeleton/i);
});
