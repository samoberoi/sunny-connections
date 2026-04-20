import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3cba4a3ec1f34ad6a31489cd8cd75c89',
  appName: 'Clean Fit',
  webDir: 'dist',
  server: {
    url: 'https://3cba4a3e-c1f3-4ad6-a314-89cd8cd75c89.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#C5F04A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
