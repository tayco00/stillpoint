// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stillpointDesktop", {
  setReminderPreferences(preferences) {
    ipcRenderer.send("stillpoint:reminder-preferences", preferences);
  },
  skipStartupUpdate() {
    ipcRenderer.send("stillpoint:skip-startup-update");
  },
});
