// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for zustand and other packages using import.meta
// This prioritizes CommonJS over ESM to avoid import.meta issues
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;

