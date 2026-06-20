import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUserStore } from '../store/useUserStore';
import { BottomNavigation } from '../components/BottomNavigation';
import { Colors } from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { initialize, profile } = useUserStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setup() {
      await initialize();
      setIsReady(true);
    }
    setup();
  }, []);

  const showOnboarding = profile && !profile.hasCompletedOnboarding;
  const pathname = usePathname();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Force onboarding redirect synchronously on render
  if (showOnboarding && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="patterns" />
        <Stack.Screen name="pattern/[id]" />
        <Stack.Screen name="problem/[id]" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="oauth2redirect" options={{ headerShown: false }} />
      </Stack>
      {!showOnboarding && <BottomNavigation />}
    </View>
  );
}
