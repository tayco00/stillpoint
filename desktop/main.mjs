import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  net,
  Notification,
  protocol,
  session,
  Tray,
} from "electron";
import updater from "electron-updater";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { autoUpdater } = updater;
const UPDATE_CHECK_DELAY_MS = 10_000;
const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const REMINDER_INTERVALS = new Set([30, 60, 90, 120]);
const isMainSmokeTest = process.argv.includes("--smoke-test");
const isQuickCaptureSmokeTest = process.argv.includes("--quick-capture-smoke-test");
const isShellSmokeTest = process.argv.includes("--shell-smoke-test");
const isSmokeTest = isMainSmokeTest || isQuickCaptureSmokeTest || isShellSmokeTest;

let mainWindow = null;
let quickCaptureWindow = null;
let tray = null;
let reminderTimer = null;
let isQuitting = false;
let hideNoticeShown = false;
let updateReady = false;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "stillpoint",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();

function rendererResponse(request) {
  const rendererRoot = path.resolve(app.getAppPath(), "desktop-dist");
  const url = new URL(request.url);
  const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(rendererRoot, requestedPath);
  const insideRenderer = filePath === rendererRoot || filePath.startsWith(`${rendererRoot}${path.sep}`);

  if (!insideRenderer) return new Response("Nicht gefunden", { status: 404 });
  return net.fetch(pathToFileURL(filePath).toString());
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function browserPreferences() {
  return {
    preload: path.join(app.getAppPath(), "desktop", "preload.cjs"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  };
}

function secureWindow(window) {
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("stillpoint://app/")) event.preventDefault();
  });
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;

  const window = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 860,
    minHeight: 640,
    show: false,
    title: "Stillpoint",
    backgroundColor: "#f1f0e8",
    icon: path.join(app.getAppPath(), "build", "icon.png"),
    webPreferences: browserPreferences(),
  });
  mainWindow = window;
  secureWindow(window);

  window.on("close", (event) => {
    if (isQuitting || isSmokeTest) return;
    event.preventDefault();
    window.hide();
    if (!hideNoticeShown && tray) {
      hideNoticeShown = true;
      tray.displayBalloon({
        title: "Stillpoint",
        content: "Stillpoint bleibt im Infobereich bereit. Schnellnotiz: Strg + Umschalt + Leertaste.",
      });
    }
  });
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null;
  });
  window.once("ready-to-show", () => {
    if (!isSmokeTest) window.show();
  });
  window.webContents.once("did-fail-load", () => {
    if (isSmokeTest) app.exit(1);
  });
  window.webContents.once("did-finish-load", async () => {
    if (!isMainSmokeTest && !isShellSmokeTest) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const appIsReady = await window.webContents.executeJavaScript(
      "Boolean(document.title === 'Stillpoint' && document.querySelector('h1')?.textContent?.includes('Weniger') && document.querySelector('#workspace') && document.querySelector('.first-run-dialog[open] #profile-name') && document.querySelector('.soundscape-card') && document.querySelector('.reminder-card') && document.querySelector('.weekly-review'))",
    );
    await window.webContents.executeJavaScript(
      "window.stillpointDesktop?.setReminderPreferences({ enabled: true, intervalMinutes: 30 })",
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    const shellIsReady = !isShellSmokeTest || Boolean(
      tray && globalShortcut.isRegistered("CommandOrControl+Shift+Space"),
    );
    app.exit(appIsReady && reminderTimer && shellIsReady ? 0 : 1);
  });
  void window.loadURL("stillpoint://app/index.html");
  return window;
}

function openQuickCapture() {
  if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
    quickCaptureWindow.show();
    quickCaptureWindow.focus();
    return;
  }

  const window = new BrowserWindow({
    width: 500,
    height: 430,
    minWidth: 420,
    minHeight: 380,
    maxWidth: 640,
    maxHeight: 560,
    show: false,
    title: "Stillpoint",
    backgroundColor: "#d8ff4f",
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), "build", "icon.png"),
    webPreferences: browserPreferences(),
  });
  quickCaptureWindow = window;
  secureWindow(window);
  window.once("ready-to-show", () => {
    if (!isSmokeTest) {
      window.show();
      window.focus();
    }
  });
  window.webContents.once("did-fail-load", () => {
    if (isQuickCaptureSmokeTest) app.exit(1);
  });
  window.webContents.once("did-finish-load", async () => {
    if (!isQuickCaptureSmokeTest) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
    const captureSaved = await window.webContents.executeJavaScript(`
      (async () => {
        const input = document.querySelector('#quick-note');
        const form = document.querySelector('form');
        if (!input || !form) return false;
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        valueSetter.call(input, 'Smoke-Test-Notiz');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        form.requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const stored = JSON.parse(localStorage.getItem('stillpoint:v1') || '{}');
        return stored.notes?.some((note) => note.text === 'Smoke-Test-Notiz') === true;
      })()
    `);
    app.exit(captureSaved ? 0 : 1);
  });
  window.on("closed", () => {
    if (quickCaptureWindow === window) quickCaptureWindow = null;
  });
  void window.loadURL("stillpoint://app/index.html#quick-capture");
}

function quitStillpoint() {
  isQuitting = true;
  app.quit();
}

function installReadyUpdate() {
  if (!updateReady) return;
  isQuitting = true;
  autoUpdater.quitAndInstall(false, true);
}

function updateTrayMenu() {
  if (!tray) return;
  const template = [
    { label: "Stillpoint öffnen", click: showMainWindow },
    { label: "Schnellnotiz", accelerator: "CommandOrControl+Shift+Space", click: openQuickCapture },
    ...(updateReady
      ? [{ type: "separator" }, { label: "Update installieren und neu starten", click: installReadyUpdate }]
      : []),
    { type: "separator" },
    { label: "Stillpoint beenden", click: quitStillpoint },
  ];
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function createTray() {
  const trayImage = nativeImage
    .createFromPath(path.join(app.getAppPath(), "build", "icon.png"))
    .resize({ width: 20, height: 20 });
  tray = new Tray(trayImage);
  tray.setToolTip("Stillpoint");
  tray.on("click", showMainWindow);
  updateTrayMenu();
}

function showFocusReminder() {
  if (!Notification.isSupported() || BrowserWindow.getFocusedWindow()) return;
  const notification = new Notification({
    title: "Stillpoint",
    body: "Ein ruhiger Moment: Ist dein nächster guter Schritt noch der richtige?",
    silent: true,
  });
  notification.on("click", showMainWindow);
  notification.show();
}

function configureReminder(preferences) {
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = null;
  const intervalMinutes = Number(preferences?.intervalMinutes);
  if (preferences?.enabled !== true || !REMINDER_INTERVALS.has(intervalMinutes)) return;
  reminderTimer = setInterval(showFocusReminder, intervalMinutes * 60 * 1000);
}

function checkForUpdates() {
  void autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error("Stillpoint update check failed", error);
  });
}

function startAutomaticUpdates() {
  if (!app.isPackaged || isSmokeTest) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("update-downloaded", () => {
    updateReady = true;
    updateTrayMenu();
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: "Stillpoint-Update bereit",
        body: "Klicke hier, um Stillpoint neu zu starten und das Update zu installieren.",
      });
      notification.on("click", installReadyUpdate);
      notification.show();
    }
  });

  const initialCheck = setTimeout(checkForUpdates, UPDATE_CHECK_DELAY_MS);
  const recurringCheck = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
  app.once("before-quit", () => {
    clearTimeout(initialCheck);
    clearInterval(recurringCheck);
  });
}

if (singleInstance) {
  app.on("second-instance", showMainWindow);

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(false);
    });
    await protocol.handle("stillpoint", rendererResponse);
    ipcMain.on("stillpoint:reminder-preferences", (_event, preferences) => {
      configureReminder(preferences);
    });

    if (isQuickCaptureSmokeTest) openQuickCapture();
    else createMainWindow();
    if (!isSmokeTest || isShellSmokeTest) {
      createTray();
      globalShortcut.register("CommandOrControl+Shift+Space", openQuickCapture);
    }
    startAutomaticUpdates();

    app.on("activate", showMainWindow);
  });

  app.on("before-quit", () => {
    isQuitting = true;
    if (reminderTimer) clearInterval(reminderTimer);
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    if (isSmokeTest) app.quit();
  });
}
