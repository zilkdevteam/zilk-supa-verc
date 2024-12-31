import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Zilk',
  slug: 'zilk',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.zilk.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Zilk needs your location to show you nearby deals.',
      NSLocationAlwaysUsageDescription: 'Zilk needs your location to verify deal redemptions.',
      NFCReaderUsageDescription: 'Zilk uses NFC to activate deals and verify redemptions.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.zilk.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'NFC'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'react-native-nfc-manager',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Zilk to use your location to find nearby deals and verify redemptions.'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  owner: 'zilk'
}); 