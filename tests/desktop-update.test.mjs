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

test("ships an installable GitHub update channel", () => {
  assert.equal(packageJson.version, "0.2.0");
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
});

test("checks for updates only in packaged, non-smoke-test builds", () => {
  assert.match(desktopMain, /from "electron-updater"/);
  assert.match(desktopMain, /if \(!app\.isPackaged \|\| isSmokeTest\) return/);
  assert.match(desktopMain, /checkForUpdatesAndNotify\(\)/);
  assert.match(desktopMain, /autoDownload = true/);
  assert.match(desktopMain, /autoInstallOnAppQuit = true/);
});
