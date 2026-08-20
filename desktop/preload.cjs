// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stillpointDesktop", {
  setReminderPreferences(preferences) {
    ipcRenderer.send("stillpoint:reminder-preferences", preferences);
  },
  skipStartupUpdate() {
    ipcRenderer.send("stillpoint:skip-startup-update");
  },
  checkForUpdates() {
    return ipcRenderer.invoke("stillpoint:check-for-updates");
  },
  installReadyUpdate() {
    ipcRenderer.send("stillpoint:install-update");
  },
  onUpdateStatus(callback) {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("stillpoint:update-status", listener);
    return () => ipcRenderer.removeListener("stillpoint:update-status", listener);
  },
});
