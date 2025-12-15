import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// A single floating orb component
const Orb = ({ color, size, initialX, initialY, duration = 4000 }: any) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Random movement logic
    translateX.value = withRepeat(
      withSequence(
        withTiming(initialX + Math.random() * 100 - 50, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialX - Math.random() * 100 + 50, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialX, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(initialY + Math.random() * 100 - 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialY - Math.random() * 100 + 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialY, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle
      ]}
    />
  );
};

export const LiquidBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep base background */}
      <LinearGradient
        colors={['#000000', '#0f172a', '#1e1b4b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Animated Orbs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Orb color="#4f46e5" size={250} initialX={-50} initialY={-50} duration={6000} />
        <Orb color="#7c3aed" size={200} initialX={width - 100} initialY={height / 2} duration={7000} />
        <Orb color="#06b6d4" size={280} initialX={-50} initialY={height - 150} duration={8000} />
      </View>

      {/* Glass overlay to blur the orbs */}
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Subtle grain or noise could go here */}
    </View>
  );
};

