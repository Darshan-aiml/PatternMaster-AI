import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Flame, Search, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { SlidingFilter } from '../components/SlidingFilter';
import { PATTERNS } from '../data/patterns';
import { M3Pressable } from '../components/M3Pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PatternsScreen from './patterns';
import ProgressScreen from './progress';
import ProfileScreen from './profile';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, progress, getFilteredProblems, getRecommendation, activeTab } = useUserStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'weakest' | 'revision-due'>('all');

  const recommendation = useMemo(() => getRecommendation(), [progress]);
  const filteredProblems = useMemo(() => getFilteredProblems(activeFilter), [activeFilter, progress]);
  const router = useRouter(); // Added router definition

  const handleFilterChange = (filter: typeof activeFilter) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setActiveFilter(filter);
  };

  const filterOptions = [
    { id: 'all', label: 'All', value: 'all' as const },
    { id: 'in-progress', label: 'In Progress', value: 'in-progress' as const },
    { id: 'weakest', label: 'Weakest', value: 'weakest' as const },
    { id: 'revision-due', label: 'Revision Due', value: 'revision-due' as const }
  ];

  // Get total stats
  const totalSolved = Object.values(progress).filter(p => p.status === 'solved').length;
  const totalProblems = PATTERNS.reduce((acc, p) => acc + p.problems.length, 0);
  const completionPercentage = Math.round((totalSolved / totalProblems) * 100) || 0;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: completionPercentage,
      stiffness: 120,
      damping: 12,
      useNativeDriver: false, // width requires JS thread
    }).start();
  }, [completionPercentage]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (activeTab === 'patterns') {
    return <PatternsScreen isTab={true} />;
  }
  if (activeTab === 'progress') {
    return <ProgressScreen isTab={true} />;
  }
  if (activeTab === 'profile') {
    return <ProfileScreen isTab={true} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.userName || 'Scholar'}</Text>
            <Text style={styles.todayFocus}>Master DSA</Text>
          </View>
          <M3Pressable style={styles.iconButton} onPress={() => router.replace('/patterns')}>
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Search color={Colors.text} size={22} />
            </View>
          </M3Pressable>
        </View>

        {/* Progress Overview Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressContent}>
            <View>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressValue}>{completionPercentage}%</Text>
              <Text style={styles.progressSubtext}>
                {totalSolved} of {totalProblems} problems solved
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.circleText}>{completionPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: animatedWidth }
              ]}
            />
          </View>
        </View>

        {/* Today's Focus (Personalized Recommendation Engine) */}
        {recommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Focus</Text>
            <Link href={`/problem/${recommendation.problem.id}`} asChild>
              <M3Pressable style={styles.nextPatternCard}>
                <View style={styles.cardContentWrapper}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={styles.patternBadge}>
                      <Flame color={Colors.primary} size={14} />
                      <Text style={[styles.patternTag, { marginLeft: 4 }]}>{recommendation.pattern.name}</Text>
                    </View>
                    <View style={styles.masteryBadgeHome}>
                      <Text style={styles.masteryTextHome}>Mastery: {recommendation.mastery}%</Text>
                    </View>
                  </View>

                  <Text style={styles.patternTitle}>{recommendation.problem.title}</Text>
                  
                  <Text style={styles.recommendationReason}>{recommendation.reason}</Text>

                  <View style={styles.recommendationMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Last Practiced</Text>
                      <Text style={styles.metaValue}>{recommendation.lastPracticedText}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Est. Time</Text>
                      <Text style={styles.metaValue}>{recommendation.estTime} Mins</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Difficulty</Text>
                      <Text style={[styles.metaValue, styles[`difficulty_${recommendation.difficulty.toLowerCase()}` as any]]}>
                        {recommendation.difficulty}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ctaButton}>
                    <Text style={styles.ctaText}>Start Solving</Text>
                    <ArrowRight color={Colors.onPrimary} size={18} />
                  </View>
                </View>
              </M3Pressable>
            </Link>
          </View>
        )}

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 24 }]}>Browse Problems</Text>
          <SlidingFilter 
            options={filterOptions}
            onFilterChange={handleFilterChange}
            defaultFilter={activeFilter}
          />
        </View>

        {/* Problems List */}
        {filteredProblems.length > 0 ? (
          <View style={styles.problemsList}>
            {filteredProblems.slice(0, 5).map(({ problemId, patternId }) => {
              const pattern = PATTERNS.find(p => p.id === patternId);
              const problem = pattern?.problems.find(pr => pr.id === problemId);
              const prob = progress[problemId];

              if (!problem) return null;

              const isSolved = prob?.status === 'solved';
              const needsRevision = prob?.status === 'needs-revision';

              return (
                <Link key={problemId} href={`/problem/${problemId}`} asChild>
                  <M3Pressable style={styles.problemCard}>
                    <View style={styles.problemInner}>
                      <View style={styles.problemStatus}>
                        {isSolved ? (
                          <CheckCircle color={Colors.success} size={20} />
                        ) : needsRevision ? (
                          <AlertCircle color={Colors.warning} size={20} />
                        ) : (
                          <View style={styles.emptyCircle} />
                        )}
                      </View>
                      <View style={styles.problemContent}>
                        <Text style={styles.problemPattern}>{pattern?.name}</Text>
                        <Text style={styles.problemTitle}>{problem.title}</Text>
                        <View style={styles.problemMeta}>
                          <Text style={styles.difficulty}>{problem.difficulty}</Text>
                          {prob?.masteryLevel ? (
                            <Text style={styles.masteryBadge}>
                              Mastery: {prob.masteryLevel}%
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </M3Pressable>
                </Link>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No problems found</Text>
          </View>
        )}

        {/* View All Link */}
        {filteredProblems.length > 5 && (
          <Link href="/patterns" asChild>
            <M3Pressable style={styles.viewAllButton}>
              <View style={styles.viewAllInner}>
                <Text style={styles.viewAllText}>View All Problems</Text>
                <ArrowRight color={Colors.primary} size={20} />
              </View>
            </M3Pressable>
          </Link>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  todayFocus: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  progressSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  circleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  nextPatternCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  cardContentWrapper: {
    padding: 20,
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  patternTag: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    marginLeft: 6,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
  },
  filterSection: {
    marginBottom: 8,
  },
  problemsList: {
    marginHorizontal: 24,
    gap: 10,
  },
  problemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  problemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  problemStatus: {
    marginRight: 14,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.muted,
  },
  problemContent: {
    flex: 1,
  },
  problemPattern: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  problemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  masteryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  viewAllButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  viewAllInner: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  masteryBadgeHome: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  masteryTextHome: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  recommendationReason: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.outline,
    marginBottom: 18,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  difficulty_easy: {
    color: Colors.success,
  },
  difficulty_medium: {
    color: Colors.warning,
  },
  difficulty_hard: {
    color: Colors.danger,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});

