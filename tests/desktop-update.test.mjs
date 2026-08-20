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
const desktopSettings = await readFile(
  new URL("../app/components/DesktopSettings.tsx", import.meta.url),
  "utf8",
);
const updateService = await readFile(
  new URL("../desktop/update-service.mjs", import.meta.url),
  "utf8",
);
const desktopUpdateCode = desktopMain + "\n" + updateService;
const profileSettings = await readFile(
  new URL("../app/components/ProfileSettings.tsx", import.meta.url),
  "utf8",
);
const profilePicker = await readFile(
  new URL("../app/components/ProfilePicker.tsx", import.meta.url),
  "utf8",
);
const focusTimer = await readFile(
  new URL("../app/components/FocusTimer.tsx", import.meta.url),
  "utf8",
);
const sessionHistory = await readFile(
  new URL("../app/components/SessionHistory.tsx", import.meta.url),
  "utf8",
);
const interactiveTools = await readFile(
  new URL("../app/components/InteractiveTools.tsx", import.meta.url),
  "utf8",
);
const stillpointState = await readFile(
  new URL("../app/lib/stillpoint.ts", import.meta.url),
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
  assert.equal(packageJson.version, "0.4.3");
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

test("keeps quick capture and settings-based reminders in the desktop shell", () => {
  assert.match(desktopMain, /new Tray\(/);
  assert.match(desktopMain, /CommandOrControl\+Shift\+Space/);
  assert.match(desktopMain, /stillpoint:\/\/app\/index\.html#quick-capture/);
  assert.match(desktopMain, /new Notification\(/);
  assert.match(desktopMain, /setInterval\(showFocusReminder/);
  assert.match(desktopMain, /--shell-smoke-test/);
  assert.match(preload, /stillpoint:reminder-preferences/);
  assert.match(desktopSettings, /Einstellungen/);
  assert.match(desktopSettings, /Sanfte Erinnerung/);
  assert.match(desktopSettings, /role="switch"/);
  assert.doesNotMatch(interactiveTools, /ReminderTool|Sanfte Erinnerung/);
});

test("adds profile selection, large text, a completion cue, and manual updates", () => {
  assert.match(profilePicker, /Wer nutzt Stillpoint/);
  assert.match(profileSettings, /Weiteres Profil/);
  assert.match(desktopSettings, /Schriftgröße/);
  assert.match(desktopSettings, /Abschlusston/);
  assert.match(desktopSettings, /completion-sound-volume/);
  assert.match(desktopSettings, /Ton anhören/);
  assert.match(desktopSettings, /Nach Updates suchen/);
  assert.match(focusTimer, /playCompletionTone/);
  assert.match(focusTimer, /completionSoundVolume/);
  assert.match(preload, /stillpoint:check-for-updates/);
  assert.match(preload, /stillpoint:update-status/);
  assert.match(updateService, /checkManually/);
  assert.match(desktopMain, /stillpoint:install-update/);
});

test("keeps past sessions in a compact, closed disclosure by default", () => {
  assert.match(sessionHistory, /<details className="session-history">/);
  assert.match(sessionHistory, /<summary className="history-summary">/);
  assert.doesNotMatch(sessionHistory, /<details[^>]+open/);
});

test("removes offline soundscapes from UI and persisted state", () => {
  assert.doesNotMatch(interactiveTools, /Soundscape|soundscape|Klangraum/);
  assert.doesNotMatch(desktopSettings, /Soundscape|soundscape|Klangraum/);
  assert.doesNotMatch(stillpointState, /Soundscape|soundscape/);
});

test("checks for updates only in packaged, non-smoke-test builds", () => {
  assert.match(updateService, /from "electron-updater"/);
  assert.match(updateService, /if \(!app\.isPackaged \|\| isSmokeTest\) return/);
  assert.match(updateService, /checkForUpdatesAndNotify\(\)/);
  assert.match(updateService, /autoDownload = true/);
  assert.match(updateService, /autoInstallOnAppQuit = true/);
});

test("shows real startup update status and offers a safe skip action", () => {
  assert.match(desktopMain, /--startup-smoke-test/);
  assert.match(desktopUpdateCode, /"checking-for-update"/);
  assert.match(desktopUpdateCode, /"update-available"/);
  assert.match(desktopUpdateCode, /"download-progress"/);
  assert.match(desktopUpdateCode, /"update-not-available"/);
  assert.match(desktopUpdateCode, /quitAndInstall\(false, true\)/);
  assert.match(desktopMain, /stillpoint:skip-startup-update/);
  assert.match(preload, /stillpoint:skip-startup-update/);
  assert.match(startupHtml, /id="startup-progress" role="progressbar"/);
  assert.match(startupHtml, /Ohne Update starten/);
  assert.match(startupRenderer, /setStillpointStatus/);
  assert.match(startupRenderer, /aria-valuenow/);
});
