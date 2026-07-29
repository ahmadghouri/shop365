const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add .mjs extension support for lucide-react-native
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs'];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
