declare module "*.css?raw" {
  const content: string;
  export default content;
}

interface Window {
  stillpointDesktop?: {
    setReminderPreferences: (preferences: {
      enabled: boolean;
      intervalMinutes: 30 | 60 | 90 | 120;
    }) => void;
    skipStartupUpdate: () => void;
    checkForUpdates: () => Promise<{
      state:
        | "idle"
        | "checking"
        | "available"
        | "downloading"
        | "ready"
        | "current"
        | "error";
      message: string;
      progress?: number;
    }>;
    installReadyUpdate: () => void;
    onUpdateStatus: (
      callback: (status: {
        state:
          | "idle"
          | "checking"
          | "available"
          | "downloading"
          | "ready"
          | "current"
          | "error";
        message: string;
        progress?: number;
      }) => void,
    ) => () => void;
  };
}
