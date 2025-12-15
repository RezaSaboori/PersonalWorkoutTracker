// src/components/ModernDock.tsx
// iOS 18+ Liquid Glass Dock
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Dumbbell, TrendingUp, User } from 'lucide-react-native';
import { colors, radius, spacing, calculateNestedRadius, shadows } from '../theme/design-system';

interface DockItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'progress', icon: TrendingUp, label: 'Progress' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface ModernDockProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export const ModernDock = ({ currentTab, onTabChange }: ModernDockProps) => {
  // Dock: 28px radius, 16px padding
  // Icon container: 48px
  // Active indicator: Should be bigger than icon (22px) or fill the container
  const dockRadius = radius.xl; // 28px
  const dockPadding = spacing.md; // 16px
  const iconContainerSize = 48;
  const iconSize = 22;
  const activeIndicatorSize = 40; // Bigger than icon, fills most of container
  const innerRadius = calculateNestedRadius(dockRadius, dockPadding); // 12px

  return (
    <View style={styles.container}>
      <View style={[styles.dockWrapper, shadows.floating]}>
        {/* iOS 18+ Liquid Glass Background */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 100 : 80}
          tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'dark'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.dockContent}>
          {DOCK_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  onPress={() => onTabChange(item.id)}
                  style={styles.dockItem}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    { borderRadius: innerRadius },
                    isActive && styles.iconContainerActive
                  ]}>
                    {isActive && (
                      <View style={[
                        styles.activeIndicator,
                        { 
                          width: activeIndicatorSize,
                          height: activeIndicatorSize,
                          borderRadius: activeIndicatorSize / 2
                        }
                      ]} />
                    )}
                    <Icon
                      size={iconSize}
                      color={isActive ? colors.accent.primary : colors.text.secondary}
                      style={styles.icon}
                    />
                  </View>
                </TouchableOpacity>
                {index < DOCK_ITEMS.length - 1 && <View style={styles.gap} />}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dockWrapper: {
    height: 72,
    borderRadius: radius.xl, // 28px
    backgroundColor: 'transparent', // Glass effect handles background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Enhanced border for glass effect
    overflow: 'hidden',
    // 12px margin from bottom (handled by container padding)
  },
  dockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.md, // 16px
    height: '100%',
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  gap: {
    width: spacing.sm, // 12px
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    opacity: 0.25,
  },
  icon: {
    zIndex: 1,
  },
});
