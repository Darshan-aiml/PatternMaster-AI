import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export function useBackToHome() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onBackPress = () => {
      if (pathname !== '/') {
        if (router.canGoBack()) {
          router.back();
          return true; // Intercepted and went back in history
        }
      }
      return false; // Let the system handle it (exit app)
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, [pathname, router]);
}
