const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add .mjs extension support for lucide-react-native
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs'];

// Shim react-native-reanimated (nativewind requires it in animation paths even
// when unused). Delete this alias + ./shims/ if reanimated is installed for real.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-reanimated': path.resolve(__dirname, './shims/react-native-reanimated.js'),
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
