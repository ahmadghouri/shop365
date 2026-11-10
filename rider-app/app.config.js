// Extends app.json with values from .env (Expo loads .env automatically).
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    permissions: [
      ...(config.android?.permissions || []),
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ],
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY },
    },
  },
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
    },
  },
  plugins: [
    ...(config.plugins || []),
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Rider App uses your location to guide you to the customer and share your position with them during a delivery.',
      },
    ],
  ],
});
