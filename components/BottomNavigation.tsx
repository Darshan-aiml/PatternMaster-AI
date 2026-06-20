import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Home, BookOpen, TrendingUp, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useUserStore } from '../store/useUserStore';

interface NavItemProps {
  active: boolean;
  label: string;
  icon: any;
  onPress: () => void;
}

const NavTab = ({ active, label, icon: Icon, onPress }: NavItemProps) => {
  const scaleX = useRef(new Animated.Value(active ? 1 : 0.5)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;
  const scaleIcon = useRef(new Animated.Value(active ? 1.08 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleX, {
        toValue: active ? 1 : 0.5,
        stiffness: 180,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: active ? 1 : 0,
        stiffness: 180,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.spring(scaleIcon, {
        toValue: active ? 1.08 : 1,
        stiffness: 220,
        damping: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active]);

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.activePill,
            {
              transform: [{ scaleX }],
              opacity,
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: scaleIcon }] }}>
          <Icon
            size={24}
            color={active ? Colors.onSecondaryContainer : Colors.textSecondary}
            strokeWidth={active ? 2.2 : 1.8}
          />
        </Animated.View>
      </View>
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useUserStore();

  const navItems = [
    { icon: Home, label: 'Home', route: '/', key: 'home' as const },
    { icon: BookOpen, label: 'Patterns', route: '/patterns', key: 'patterns' as const },
    { icon: TrendingUp, label: 'Progress', route: '/progress', key: 'progress' as const },
    { icon: User, label: 'Profile', route: '/profile', key: 'profile' as const }
  ];

  // Hide navigation bar on onboarding screens to maximize space
  if (pathname === '/onboarding') return null;

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {navItems.map((item) => {
          const active = activeTab === item.key;

          return (
            <NavTab
              key={item.route}
              active={active}
              label={item.label}
              icon={item.icon}
              onPress={() => {
                setActiveTab(item.key);
                if (pathname !== '/') {
                  router.replace('/');
                }
              }}
            />
          );
        })}
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
    height: 80,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.outline,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  labelInactive: {
    color: Colors.textSecondary,
  },
});

