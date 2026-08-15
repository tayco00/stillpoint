import { app, BrowserWindow, Menu, net, protocol, session } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

    const appIsReady = await window.webContents.executeJavaScript(
      "Boolean(document.querySelector('h1')?.textContent?.includes('Weniger') && document.querySelector('#workspace'))",
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
