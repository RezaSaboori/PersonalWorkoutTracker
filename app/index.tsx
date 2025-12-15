// Root redirects to tabs or onboarding
import { Redirect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';

export default function Index() {
  const profile = useUserStore((state) => state.profile);
  
  // Check if user has completed onboarding
  if (!profile?.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }
  
  return <Redirect href="/(tabs)" />;
}