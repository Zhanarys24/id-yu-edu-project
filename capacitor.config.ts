import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.YU_ID.app',
  appName: 'YU_ID',
  webDir: 'public',  // или 'out' если используешь next export
  server: {
    url: 'http://10.0.2.2:3000',  // адрес локального сервера для Android эмулятора
    cleartext: true               // разрешаем http, а не https
  }
};

export default config;
