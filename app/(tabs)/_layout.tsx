// app/(tabs)/_layout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { ModernDock } from '../../src/components/ModernDock';

export default function TabsLayout() {
  const pathname = usePathname();
  
  // Map pathname to tab ID
  const getCurrentTab = () => {
    if (pathname?.includes('/workout')) return 'workout';
    if (pathname?.includes('/progress')) return 'progress';
    if (pathname?.includes('/profile')) return 'profile';
    return 'home';
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={(props) => (
          <ModernDock
            currentTab={getCurrentTab()}
            onTabChange={(tabId) => {
              const routeMap: Record<string, string> = {
                home: 'index',
                workout: 'workout',
                progress: 'progress',
                profile: 'profile',
              };
              const routeName = routeMap[tabId];
              if (routeName) {
                props.navigation.navigate(routeName as any);
              }
            }}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="workout" />
        <Tabs.Screen name="progress" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
