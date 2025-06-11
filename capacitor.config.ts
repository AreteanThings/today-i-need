
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.be88d90c168d4adc9bd3ddf898e8d648',
  appName: 'today-i-need-it-now',
  webDir: 'dist',
  server: {
    url: 'https://be88d90c-168d-4adc-9bd3-ddf898e8d648.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
