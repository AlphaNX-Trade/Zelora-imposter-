import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zeloragroups.imposter',
  appName: 'Zelora Imposter',
  webDir: 'dist',
  backgroundColor: '#09090D',
  android: {
    allowMixedContent: false,
    backgroundColor: '#09090D',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#09090D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090D',
    },
  },
};

export default config;
