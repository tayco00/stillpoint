import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const desktopMain = await readFile(
  new URL("../desktop/main.mjs", import.meta.url),
  "utf8",
);
const preload = await readFile(new URL("../desktop/preload.cjs", import.meta.url), "utf8");
const onboarding = await readFile(
  new URL("../app/components/FirstRunOnboarding.tsx", import.meta.url),
  "utf8",
);
const startupHtml = await readFile(
  new URL("../desktop/startup.html", import.meta.url),
  "utf8",
);
const startupRenderer = await readFile(
  new URL("../desktop/startup-renderer.js", import.meta.url),
  "utf8",
);

test("ships an installable GitHub update channel", () => {
  assert.equal(packageJson.version, "0.3.2");
  assert.equal(packageJson.dependencies["electron-updater"], "^6.8.9");
  assert.equal(packageJson.build.win.target, "nsis");
  assert.equal(packageJson.build.nsis.artifactName, "Stillpoint-Setup.exe");
  assert.deepEqual(packageJson.build.publish, [
    {
      provider: "github",
      owner: "tayco00",
      repo: "stillpoint",
      releaseType: "release",
    },
  ]);
  assert.ok(packageJson.build.files.includes("desktop/startup.html"));
  assert.ok(packageJson.build.files.includes("desktop/startup-renderer.js"));
  assert.ok(packageJson.build.files.includes("desktop/startup-window.mjs"));
});

test("keeps the personal greeting concise and rotates neutral example names", () => {
  const namesBlock = onboarding.match(/const EXAMPLE_NAMES = \[([\s\S]*?)\];/)?.[1] || "";
  const names = [...namesBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.match(onboarding, /Schön, dass du da bist/);
  assert.match(onboarding, /EXAMPLE_NAMES = \[/);
  assert.match(onboarding, /setInterval/);
  assert.equal(names.length, 28);
  assert.equal(new Set(names).size, 28);
  assert.ok(!names.includes("Taylan"));
});

test("keeps quick capture and gentle reminders in the desktop shell", () => {
  assert.match(desktopMain, /new Tray\(/);
  assert.match(desktopMain, /CommandOrControl\+Shift\+Space/);
  assert.match(desktopMain, /stillpoint:\/\/app\/index\.html#quick-capture/);
  assert.match(desktopMain, /new Notification\(/);
  assert.match(desktopMain, /setInterval\(showFocusReminder/);
  assert.match(desktopMain, /--shell-smoke-test/);
  assert.match(preload, /stillpoint:reminder-preferences/);
});

test("checks for updates only in packaged, non-smoke-test builds", () => {
  assert.match(desktopMain, /from "electron-updater"/);
  assert.match(desktopMain, /if \(!app\.isPackaged \|\| isSmokeTest\) return/);
  assert.match(desktopMain, /checkForUpdatesAndNotify\(\)/);
  assert.match(desktopMain, /autoDownload = true/);
  assert.match(desktopMain, /autoInstallOnAppQuit = true/);
});

test("shows real startup update status and offers a safe skip action", () => {
  assert.match(desktopMain, /--startup-smoke-test/);
  assert.match(desktopMain, /"checking-for-update"/);
  assert.match(desktopMain, /"update-available"/);
  assert.match(desktopMain, /"download-progress"/);
  assert.match(desktopMain, /"update-not-available"/);
  assert.match(desktopMain, /quitAndInstall\(false, true\)/);
  assert.match(desktopMain, /stillpoint:skip-startup-update/);
  assert.match(preload, /stillpoint:skip-startup-update/);
  assert.match(startupHtml, /id="startup-progress" role="progressbar"/);
  assert.match(startupHtml, /Ohne Update starten/);
  assert.match(startupRenderer, /setStillpointStatus/);
  assert.match(startupRenderer, /aria-valuenow/);
});
