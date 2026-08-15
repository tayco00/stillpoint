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
  };
}
