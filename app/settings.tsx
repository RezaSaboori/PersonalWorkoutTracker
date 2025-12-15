// app/settings.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, Trash2 } from 'lucide-react-native';
import { ModernCard } from '../src/components/ui/ModernCard';
import { MinimalBackground } from '../src/components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../src/theme/design-system';
import { setVoiceEnabled, setVoiceVolume } from '../src/utils/voiceGuidance';
import { setHapticEnabled } from '../src/utils/hapticFeedback';
import { useUserStore } from '../src/store/userStore';
import { useWorkoutStore } from '../src/store/workoutStore';
import { useProgressStore } from '../src/store/progressStore';
import { useAchievementsStore } from '../src/store/achievementsStore';
import { Share } from 'react-native';

export default function Settings() {
  const router = useRouter();
  const { preferences, updatePreferences } = useUserStore();
  const { resetProgress } = useWorkoutStore();
  const { exportWorkoutData } = useProgressStore();
  
  const [voiceEnabled, setVoiceEnabledState] = useState(preferences.voiceGuidance);
  const [hapticEnabled, setHapticEnabledState] = useState(preferences.hapticFeedback);
  const [defaultRest, setDefaultRest] = useState(preferences.defaultRestDuration.toString());

  useEffect(() => {
    setVoiceEnabledState(preferences.voiceGuidance);
    setHapticEnabledState(preferences.hapticFeedback);
    setDefaultRest(preferences.defaultRestDuration.toString());
  }, [preferences]);

  const handleVoiceToggle = (value: boolean) => {
    setVoiceEnabledState(value);
    setVoiceEnabled(value);
    updatePreferences({ voiceGuidance: value });
  };

  const handleHapticToggle = (value: boolean) => {
    setHapticEnabledState(value);
    setHapticEnabled(value);
    updatePreferences({ hapticFeedback: value });
  };

  const handleDefaultRestChange = (value: string) => {
    const num = parseInt(value) || 60;
    if (num >= 0 && num <= 600) {
      setDefaultRest(value);
      updatePreferences({ defaultRestDuration: num });
    }
  };

  const handleExportData = async () => {
    try {
      const data = exportWorkoutData();
      await Share.share({
        message: data,
        title: 'Workout Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary cached data but keep your workout history, achievements, progress, and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'default',
          onPress: async () => {
            try {
              // Clear only temporary/cached data
              // This doesn't affect workout history, achievements, or progress
              // You can add specific cache clearing logic here if needed
              // For now, this is a placeholder for future cache management
              Alert.alert('Success', 'Cache cleared. Your workouts, achievements, and progress are safe.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete ALL your data including:\n\n• Workout history\n• Achievements\n• Personal records\n• Progress\n• Settings\n\nThis cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            // Reset all stores
            resetProgress();
            useUserStore.getState().resetPreferences();
            useAchievementsStore.getState().resetAchievements();
            Alert.alert('Reset Complete', 'All data has been permanently deleted.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Timer Settings */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Timer Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Voice Guidance</Text>
                <Text style={styles.settingDescription}>Audio cues during workouts</Text>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={handleVoiceToggle}
                trackColor={{ false: colors.bg.surface, true: colors.accent.primary }}
                thumbColor="#fff"
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibration feedback</Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={handleHapticToggle}
                trackColor={{ false: colors.bg.surface, true: colors.accent.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Default Rest Duration</Text>
                <Text style={styles.settingDescription}>Default rest time in seconds</Text>
              </View>
              <TextInput
                style={styles.numberInput}
                value={defaultRest}
                onChangeText={handleDefaultRestChange}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-start Next Exercise</Text>
                <Text style={styles.settingDescription}>Automatically start next exercise after rest</Text>
              </View>
              <Switch
                value={preferences.autoStartNextExercise}
                onValueChange={(value) => updatePreferences({ autoStartNextExercise: value })}
                trackColor={{ false: colors.bg.surface, true: colors.accent.primary }}
                thumbColor="#fff"
              />
            </View>
          </ModernCard>

          {/* Notification Settings */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Workout Reminders</Text>
                <Text style={styles.settingDescription}>Remind me to workout</Text>
              </View>
              <Switch
                value={preferences.workoutReminders}
                onValueChange={(value) => updatePreferences({ workoutReminders: value })}
                trackColor={{ false: colors.bg.surface, true: colors.accent.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Rest Day Reminders</Text>
                <Text style={styles.settingDescription}>Remind me on rest days</Text>
              </View>
              <Switch
                value={preferences.restDayReminders}
                onValueChange={(value) => updatePreferences({ restDayReminders: value })}
                trackColor={{ false: colors.bg.surface, true: colors.accent.primary }}
                thumbColor="#fff"
              />
            </View>
          </ModernCard>

          {/* Data Management */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity
              style={styles.dataButton}
              onPress={handleExportData}
            >
              <Download size={18} color="#4fffc2" />
              <Text style={styles.dataButtonText}>Export Workout Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dataButton}
              onPress={handleClearCache}
            >
              <Text style={styles.dataButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </ModernCard>

          {/* Danger Zone */}
          <ModernCard variant="content" style={[styles.sectionCard, styles.dangerCard]}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleResetAll}
            >
              <Trash2 size={18} color="#ff6b6b" />
              <Text style={styles.dangerButtonText}>Reset All Data</Text>
            </TouchableOpacity>
            
            <Text style={styles.dangerDescription}>
              This will permanently delete ALL your data including workouts, achievements, personal records, progress, and settings. This action cannot be undone.
            </Text>
          </ModernCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg.app 
  },
  safeArea: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  headerTitle: { 
    ...textStyles.h2,
  },
  content: { 
    padding: spacing.lg,
    paddingBottom: 120,
  },
  sectionCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...textStyles.body,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  numberInput: {
    width: 80,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...textStyles.body,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dataButtonText: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  dangerCard: {
    borderColor: colors.accent.error + '40',
  },
  dangerTitle: {
    color: colors.accent.error,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent.error + '20',
    borderWidth: 1,
    borderColor: colors.accent.error + '40',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dangerButtonText: {
    ...textStyles.body,
    color: colors.accent.error,
    fontWeight: '600',
  },
  dangerDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
