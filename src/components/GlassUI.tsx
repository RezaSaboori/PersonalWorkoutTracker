// src/components/GlassUI.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';

// Safely import liquid glass library (only works in development builds, not Expo Go)
// In Expo Go, native modules aren't available, so we always use the fallback
let LiquidGlassView: any = null;
let isLiquidGlassSupported = false;

// Only try to load native module if not in Expo Go
// Expo Go doesn't support custom native modules
const isExpoGo = Constants.executionEnvironment === 'storeClient' || 
                 Constants.appOwnership === 'expo' ||
                 !Constants.isDevice;

// Lazy load the module only when needed and not in Expo Go
function getLiquidGlassModule() {
  // Never try to load in Expo Go - it doesn't support custom native modules
  if (isExpoGo) {
    return { LiquidGlassView: null, isLiquidGlassSupported: false };
  }
  
  // If already loaded, return cached values
  if (LiquidGlassView !== null || isLiquidGlassSupported) {
    return { LiquidGlassView, isLiquidGlassSupported };
  }
  
  // Try to load the native module (only in development/production builds)
  try {
    const liquidGlass = require('@callstack/liquid-glass');
    if (liquidGlass && liquidGlass.LiquidGlassView) {
      LiquidGlassView = liquidGlass.LiquidGlassView;
      // Check support - this will be false if native module not available
      try {
        isLiquidGlassSupported = liquidGlass.isLiquidGlassSupported || false;
      } catch {
        isLiquidGlassSupported = false;
      }
    }
  } catch (error) {
    // Native module not available - use fallback
    isLiquidGlassSupported = false;
    LiquidGlassView = null;
  }
  
  return { LiquidGlassView, isLiquidGlassSupported };
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 40 }: GlassCardProps) => {
  const containerStyle = [styles.container, style];
  const { LiquidGlassView: LGView, isLiquidGlassSupported: isSupported } = getLiquidGlassModule();
  
  // Use native iOS 26 Liquid Glass if supported, otherwise fallback to BlurView
  if (isSupported && Platform.OS === 'ios' && LGView) {
    return (
      <LGView
        style={containerStyle}
        effect="regular"
        interactive
        colorScheme="dark"
      >
        <View style={styles.content}>{children}</View>
      </LGView>
    );
  }
  
  // Fallback for Android, Expo Go, or unsupported devices
  return (
    <View style={containerStyle}>
      <BlurView 
        intensity={intensity} 
        tint={Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark'} 
        style={StyleSheet.absoluteFill} 
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export const GlassButton = ({ onPress, title, active = false }: { onPress: () => void, title: string, active?: boolean }) => {
  const buttonStyle = [
    styles.buttonContainer,
    active && { borderColor: 'rgba(79, 255, 194, 0.4)' }
  ];
  const { LiquidGlassView: LGView, isLiquidGlassSupported: isSupported } = getLiquidGlassModule();
  
  // Use native iOS 26 Liquid Glass for buttons if supported
  if (isSupported && Platform.OS === 'ios' && LGView) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [
        buttonStyle,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}>
        <LGView
          style={StyleSheet.absoluteFill}
          effect="regular"
          interactive
          tintColor={active ? 'rgba(79, 255, 194, 0.2)' : undefined}
          colorScheme="dark"
        />
        <Text style={[styles.buttonText, active && { color: '#4fffc2' }]}>{title}</Text>
      </Pressable>
    );
  }
  
  // Fallback for Android, Expo Go, or unsupported devices
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      buttonStyle,
      pressed && { transform: [{ scale: 0.98 }] }
    ]}>
      <BlurView intensity={active ? 50 : 30} tint={Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark'} style={StyleSheet.absoluteFill} />
      <Text style={[styles.buttonText, active && { color: '#4fffc2' }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    padding: 20,
    zIndex: 2,
  },
  buttonContainer: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    zIndex: 10,
  },
});
