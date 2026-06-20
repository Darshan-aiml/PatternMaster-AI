import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { PATTERNS } from '../data/patterns';
import { Search, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { M3Pressable } from '../components/M3Pressable';
import { useBackToHome } from '../hooks/useBackToHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Pre-computed lowercase search index to prevent redundant lowercase conversion inside filter loops
const PATTERNS_SEARCH_INDEX = PATTERNS.map(pattern => ({
  pattern,
  searchKey: `${pattern.name.toLowerCase()} ${pattern.description.toLowerCase()}`
}));

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PatternsScreen({ isTab = false }: { isTab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const { progress, getPatternStats } = useUserStore();

  // Handle hardware back button redirection to '/'
  useBackToHome();

  const filteredPatterns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return PATTERNS;

    // Optimized loop search matching (fastest search execution time)
    const results: typeof PATTERNS = [];
    for (let i = 0; i < PATTERNS_SEARCH_INDEX.length; i++) {
      const item = PATTERNS_SEARCH_INDEX[i];
      if (item.searchKey.includes(query)) {
        results.push(item.pattern);
      }
    }
    return results;
  }, [searchQuery]);

  const isFirstRender = useRef(true);

  // Trigger fluid spring sorting transitions when search filter contents update, skipping first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.75,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, [filteredPatterns]);

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        {!isTab && (
          <M3Pressable style={styles.backButton} onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}>
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <ArrowLeft color={Colors.text} size={24} />
            </View>
          </M3Pressable>
        )}
        <Text style={[styles.headerTitle, isTab && { textAlign: 'center', flex: 1 }]}>DSA Patterns</Text>
        {!isTab && <View style={{ width: 40 }} />}
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patterns..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPatterns}
        keyExtractor={(item) => item.id}
        renderItem={({ item: pattern }) => {
          const stats = getPatternStats(pattern.id);
          
          return (
            <Link href={`/pattern/${pattern.id}`} asChild>
              <M3Pressable style={styles.patternCard}>
                <View style={styles.cardContentWrapper}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleSection}>
                      <Text style={styles.patternName}>{pattern.name}</Text>
                      <Text style={styles.description} numberOfLines={2}>
                        {pattern.description}
                      </Text>
                    </View>
                    <View style={[styles.difficultyTag, styles[pattern.difficulty.toLowerCase()]]}>
                      <Text style={styles.difficultyText}>{pattern.difficulty}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <View style={styles.masteryCircle}>
                        <Text style={styles.masteryValue}>{stats.masteryScore}%</Text>
                      </View>
                      <Text style={styles.statLabel}>Mastery</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                      <Text style={styles.statText}>
                        <Text style={styles.solved}>{stats.problemsSolved}</Text>
                        <Text style={styles.total}>/{stats.totalProblems}</Text>
                      </Text>
                      <Text style={styles.statLabel}>Problems</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                      <TrendingUp size={20} color={Colors.primary} />
                      <Text style={styles.statLabel}>Master it</Text>
                    </View>
                  </View>

                  {stats.masteryScore === 100 && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓ Mastered</Text>
                    </View>
                  )}
                </View>
              </M3Pressable>
            </Link>
          );
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No patterns found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 28, // Material 3 rounded-full search container
    height: 52,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    gap: 16,
  },
  patternCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  cardContentWrapper: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  patternName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  difficultyTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF', // White text for accessibility contrast on solid backgrounds
  },
  easy: {
    backgroundColor: Colors.success,
  },
  medium: {
    backgroundColor: Colors.warning,
  },
  hard: {
    backgroundColor: Colors.danger,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  masteryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 4,
  },
  masteryValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  statText: {
    marginBottom: 4,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: 44, // Align with circular height visually
  },
  solved: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  total: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.outline,
  },
  completedBadge: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.successContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSuccessContainer,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

