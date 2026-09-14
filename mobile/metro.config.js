const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add .mjs extension support for lucide-react-native
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs'];

// Ponytail: shim react-native-reanimated so we don't have to ship it.
// nativewind v4 / react-native-css-interop require()s it in animation paths
// even when the app doesn't use animations. Delete this alias + ../shims/
// folder if you ever `npm install react-native-reanimated` for real.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-reanimated': path.resolve(__dirname, './shims/react-native-reanimated.js'),
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
