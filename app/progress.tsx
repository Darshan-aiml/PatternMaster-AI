import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/Colors';
import { TrendingUp, Target, Clock, Trophy, ArrowLeft } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { PATTERNS } from '../data/patterns';
import { useRouter } from 'expo-router';
import { M3Pressable } from '../components/M3Pressable';
import { useBackToHome } from '../hooks/useBackToHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProgressScreen({ isTab = false }: { isTab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useUserStore();
  const [renderLimit, setRenderLimit] = React.useState(6);

  // Handle hardware back button redirection to '/'
  useBackToHome();

  // Calculate pattern progress
  const patternProgress = useMemo(() => {
    return PATTERNS.map(pattern => {
      const solved = pattern.problems.filter(p => progress[p.id]?.status === 'solved').length;
      const total = pattern.problems.length;
      const percentage = Math.round((solved / total) * 100);

      return {
        patternId: pattern.id,
        patternName: pattern.name,
        solved,
        total,
        percentage,
        difficulty: pattern.difficulty
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [progress]);

  // Calculate overall stats
  const totalSolved = Object.values(progress).filter(p => p.status === 'solved').length;
  const totalProblems = PATTERNS.reduce((acc, p) => acc + p.problems.length, 0);
  const totalPatternsMastered = patternProgress.filter(p => p.percentage === 100).length;
  const averageMastery = patternProgress.length > 0 
    ? Math.round(patternProgress.reduce((acc, p) => acc + p.percentage, 0) / patternProgress.length)
    : 0;

  const revisionDue = Object.values(progress).filter(p => p.status === 'needs-revision').length;
  const inProgress = Object.values(progress).filter(p => p.status === 'unsolved' || !p.status).length;
  const overallPercentage = Math.round((totalSolved / totalProblems) * 100) || 0;

  // Animate progress bar fill width
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: overallPercentage,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [overallPercentage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderLimit(patternProgress.length);
    }, 150);
    return () => clearTimeout(timer);
  }, [patternProgress.length]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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
        <Text style={[styles.headerTitle, isTab && { textAlign: 'center', flex: 1 }]}>Progress & Analytics</Text>
        {!isTab && <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overall Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalSolved}</Text>
            <Text style={styles.statLabel}>Solved</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Trophy size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalPatternsMastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{averageMastery}%</Text>
            <Text style={styles.statLabel}>Avg Mastery</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{revisionDue}</Text>
            <Text style={styles.statLabel}>Revision Due</Text>
          </View>
        </View>

        {/* Overall Progress Bar */}
        <View style={styles.overallProgressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Completion</Text>
            <Text style={styles.progressPercent}>{overallPercentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: animatedWidth }
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {totalSolved} of {totalProblems} problems completed
          </Text>
        </View>

        {/* Pattern Progress List */}
        <View style={styles.patternsSection}>
          <Text style={styles.sectionTitle}>Pattern Progress</Text>
          {patternProgress.slice(0, renderLimit).map((pattern) => (
            <View key={pattern.patternId} style={styles.patternCard}>
              <View style={styles.patternInfo}>
                <View>
                  <Text style={styles.patternName}>{pattern.patternName}</Text>
                  <Text style={styles.patternStat}>
                    {pattern.solved}/{pattern.total} problems solved
                  </Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{pattern.difficulty}</Text>
                </View>
              </View>

              <View style={styles.progressBarContainer2}>
                <View 
                  style={[
                    styles.progressBarFill2,
                    { width: `${pattern.percentage}%` }
                  ]}
                />
              </View>

              <View style={styles.percentageRow}>
                <Text style={styles.percentageValue}>{pattern.percentage}% Mastery</Text>
                {pattern.percentage === 100 && (
                  <Text style={styles.completedBadge}>✓ Mastered</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Learning Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Learning Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValueSolved}>{totalSolved}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>In Progress</Text>
              <Text style={styles.summaryValueProgress}>{inProgress}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Need Review</Text>
              <Text style={styles.summaryValueReview}>{revisionDue}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 140,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  overallProgressSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  patternsSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  patternCard: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  patternInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  patternStat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarContainer2: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill2: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  completedBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  summarySection: {
    marginHorizontal: 24,
  },
  summaryCard: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  summaryValueSolved: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  summaryValueProgress: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  summaryValueReview: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.warning,
  },
});

