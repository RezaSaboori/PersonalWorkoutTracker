// Expo plugin for Apple AI module
// This allows the module to be automatically included in builds
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAppleAI = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      // The native module files are already in place
      // Expo will automatically include them during build
      return config;
    },
  ]);
};

module.exports = withAppleAI;

