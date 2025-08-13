import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.app', // замени на свой
  appName: 'YU_ID',
  webDir: '.next', // теперь указываем .next, а не out
  server: {
    androidScheme: 'https'
  }
};

export default config;
