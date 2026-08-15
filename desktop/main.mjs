import { app, BrowserWindow, Menu, net, protocol, session } from "electron";
import updater from "electron-updater";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { autoUpdater } = updater;
const UPDATE_CHECK_DELAY_MS = 10_000;
const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

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

const isSmokeTest = process.argv.includes("--smoke-test");

function checkForUpdates() {
  void autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error("Stillpoint update check failed", error);
  });
}

function startAutomaticUpdates() {
  if (!app.isPackaged || isSmokeTest) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  const initialCheck = setTimeout(checkForUpdates, UPDATE_CHECK_DELAY_MS);
  const recurringCheck = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
  app.once("before-quit", () => {
    clearTimeout(initialCheck);
    clearInterval(recurringCheck);
  });
}

function rendererResponse(request) {
  const rendererRoot = path.resolve(app.getAppPath(), "desktop-dist");
  const url = new URL(request.url);
  const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(rendererRoot, requestedPath);
  const insideRenderer = filePath === rendererRoot || filePath.startsWith(`${rendererRoot}${path.sep}`);

  if (!insideRenderer) {
    return new Response("Nicht gefunden", { status: 404 });
  }

  return net.fetch(pathToFileURL(filePath).toString());
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 860,
    minHeight: 640,
    show: false,
    title: "Stillpoint",
    backgroundColor: "#f1f0e8",
    icon: path.join(app.getAppPath(), "build", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("stillpoint://app/")) {
      event.preventDefault();
    }
  });
  window.once("ready-to-show", () => {
    if (!isSmokeTest) {
      window.show();
    }
  });
  window.webContents.once("did-fail-load", () => {
    if (isSmokeTest) {
      app.exit(1);
    }
  });
  window.webContents.once("did-finish-load", async () => {
    if (!isSmokeTest) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const appIsReady = await window.webContents.executeJavaScript(
      "Boolean(document.title === 'Stillpoint' && document.querySelector('h1')?.textContent?.includes('Weniger') && document.querySelector('#workspace'))",
    );
    app.exit(appIsReady ? 0 : 1);
  });
  void window.loadURL("stillpoint://app/index.html");
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
  await protocol.handle("stillpoint", rendererResponse);
  createWindow();
  startAutomaticUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
