import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module
const AppleAIModule = NativeModulesProxy.AppleAI || new Proxy({}, {
  get() {
    // Return a no-op function instead of throwing, so the app can gracefully fallback
    return () => {
      console.warn('Apple AI module is not available. Using fallback recommendations.');
      return Promise.resolve('[]');
    };
  },
});

export default AppleAIModule;

