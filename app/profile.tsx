import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useUserStore } from '../store/useUserStore';
import { Colors } from '../constants/Colors';
import { LogOut, Edit2, Check, ArrowLeft, ShieldCheck, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { M3Pressable } from '../components/M3Pressable';
import { useBackToHome } from '../hooks/useBackToHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PATTERNS } from '../data/patterns';

export default function ProfileScreen({ isTab = false }: { isTab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, progress, updateProfile, resetAllData } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.userName || '');
  const [selectedLang, setSelectedLang] = useState(profile?.preferredLanguage || 'Python');

  // Keep state variables in sync with store
  React.useEffect(() => {
    if (profile && !isEditing) {
      setEditName(profile.userName);
      setSelectedLang(profile.preferredLanguage);
    }
  }, [profile, isEditing]);

  // Handle hardware back button redirection to '/'
  useBackToHome();

  const handleSave = async () => {
    const trimmedName = editName.trim().slice(0, 50);
    if (trimmedName) {
      setIsEditing(false);
      await updateProfile({
        userName: trimmedName,
        preferredLanguage: selectedLang as any
      });
    }
  };

  const handleLogout = async () => {
    await resetAllData();
    router.replace('/onboarding');
  };

  const languages = ['Python', 'C', 'Java', 'C++'] as const;

  // Advanced Stats calculations
  const stats = useMemo(() => {
    const allProblems = PATTERNS.flatMap(pat => pat.problems);
    const total = allProblems.length;
    const solved = allProblems.filter(p => progress[p.id]?.status === 'solved').length;
    
    const easyTotal = allProblems.filter(p => p.difficulty === 'Easy').length;
    const easySolved = allProblems.filter(p => p.difficulty === 'Easy' && progress[p.id]?.status === 'solved').length;
    
    const mediumTotal = allProblems.filter(p => p.difficulty === 'Medium').length;
    const mediumSolved = allProblems.filter(p => p.difficulty === 'Medium' && progress[p.id]?.status === 'solved').length;
    
    const hardTotal = allProblems.filter(p => p.difficulty === 'Hard').length;
    const hardSolved = allProblems.filter(p => p.difficulty === 'Hard' && progress[p.id]?.status === 'solved').length;

    return {
      total,
      solved,
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved
    };
  }, [progress]);

  // Contribution data for heat map: 12 weeks of data (84 days) leading to today
  const contributionGrid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Aligned starting day (11 weeks back, starting on Sunday of that week)
    const startDay = new Date(today);
    const currentDayOfWeek = startDay.getDay(); // 0 = Sun, 1 = Mon ...
    startDay.setDate(startDay.getDate() - (11 * 7) - currentDayOfWeek);
    
    // Map dates to solved counts
    const solvedCounts: Record<string, number> = {};
    Object.values(progress).forEach(p => {
      if (p.status === 'solved' && p.lastSolvedAt) {
        const dateStr = new Date(p.lastSolvedAt).toDateString();
        solvedCounts[dateStr] = (solvedCounts[dateStr] || 0) + 1;
      }
    });
    
    // Generate grid columns (weeks)
    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    const tempDate = new Date(startDay);
    
    for (let w = 0; w < 12; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = tempDate.toDateString();
        weekDays.push({
          date: new Date(tempDate),
          count: solvedCounts[dateStr] || 0
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, [progress]);

  const isGuest = !profile?.email;

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
        <Text style={[styles.headerTitle, isTab && { textAlign: 'center', flex: 1, marginLeft: 40 }]}>Profile</Text>
        <M3Pressable style={styles.editHeaderButton} onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}>
          <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {isEditing ? (
              <Check size={22} color={Colors.primary} />
            ) : (
              <Edit2 size={20} color={Colors.text} />
            )}
          </View>
        </M3Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.userName.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={(text) => setEditName(text.slice(0, 50))}
                maxLength={50}
                placeholder="Your Name"
                placeholderTextColor={Colors.textSecondary}
              />
            ) : (
              <Text style={styles.userName}>{profile?.userName || 'User'}</Text>
            )}
            
            <View style={styles.accountBadge}>
              {isGuest ? (
                <>
                  <ShieldCheck size={14} color={Colors.textSecondary} />
                  <Text style={styles.accountBadgeText}>Guest Session</Text>
                </>
              ) : (
                <>
                  <Mail size={14} color={Colors.primary} />
                  <Text style={[styles.accountBadgeText, { color: Colors.primary, fontWeight: '700' }]}>
                    Synced: {profile.email}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Activity Heat Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Map (Past 12 Weeks)</Text>
          <View style={styles.heatMapContainer}>
            {/* Days label column */}
            <View style={styles.daysColumn}>
              <Text style={styles.dayLabel}>Su</Text>
              <Text style={styles.dayLabel}>Tu</Text>
              <Text style={styles.dayLabel}>Th</Text>
              <Text style={styles.dayLabel}>Sa</Text>
            </View>
            
            {/* Weeks */}
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heatMapGrid}>
              {contributionGrid.map((week, wIdx) => (
                <View key={wIdx} style={styles.weekColumn}>
                  {week.map((day, dIdx) => {
                    let cellBg = Colors.surfaceVariant;
                    if (day.count === 1) {
                      cellBg = '#26a641';
                    } else if (day.count >= 2) {
                      cellBg = '#39d353';
                    }
                    
                    return (
                      <View 
                        key={dIdx} 
                        style={[styles.heatMapCell, { backgroundColor: cellBg }]}
                      />
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendCell, { backgroundColor: Colors.surfaceVariant }]} />
            <View style={[styles.legendCell, { backgroundColor: '#26a641' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#39d353' }]} />
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>

        {/* LeetCode style Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Solving Breakdown</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsCircleContainer}>
              <View style={styles.statCircleText}>
                <Text style={styles.totalNumber}>{stats.solved}</Text>
                <Text style={styles.totalSubText}>/ {stats.total} Solved</Text>
              </View>
            </View>

            <View style={styles.difficultyBreakdown}>
              {/* Easy */}
              <View style={styles.diffRow}>
                <View style={styles.diffLabelContainer}>
                  <Text style={[styles.diffLabel, { color: Colors.success }]}>Easy</Text>
                  <Text style={styles.diffCount}>{stats.easySolved}/{stats.easyTotal}</Text>
                </View>
                <View style={styles.diffProgressBg}>
                  <View style={[styles.diffProgressFill, { backgroundColor: Colors.success, width: `${stats.easyTotal > 0 ? (stats.easySolved/stats.easyTotal)*100 : 0}%` }]} />
                </View>
              </View>

              {/* Medium */}
              <View style={styles.diffRow}>
                <View style={styles.diffLabelContainer}>
                  <Text style={[styles.diffLabel, { color: Colors.warning }]}>Medium</Text>
                  <Text style={styles.diffCount}>{stats.mediumSolved}/{stats.mediumTotal}</Text>
                </View>
                <View style={styles.diffProgressBg}>
                  <View style={[styles.diffProgressFill, { backgroundColor: Colors.warning, width: `${stats.mediumTotal > 0 ? (stats.mediumSolved/stats.mediumTotal)*100 : 0}%` }]} />
                </View>
              </View>

              {/* Hard */}
              <View style={styles.diffRow}>
                <View style={styles.diffLabelContainer}>
                  <Text style={[styles.diffLabel, { color: Colors.danger }]}>Hard</Text>
                  <Text style={styles.diffCount}>{stats.hardSolved}/{stats.hardTotal}</Text>
                </View>
                <View style={styles.diffProgressBg}>
                  <View style={[styles.diffProgressFill, { backgroundColor: Colors.danger, width: `${stats.hardTotal > 0 ? (stats.hardSolved/stats.hardTotal)*100 : 0}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Preferred Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Language</Text>
          {isEditing ? (
            <View style={styles.langGrid}>
              {languages.map(lang => (
                <M3Pressable
                  key={lang}
                  style={[
                    styles.langOption,
                    selectedLang === lang && styles.activeLang
                  ]}
                  onPress={() => setSelectedLang(lang)}
                >
                  <Text style={[
                    styles.langText,
                    selectedLang === lang && styles.activeLangText
                  ]}>
                    {lang}
                  </Text>
                </M3Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>{profile?.preferredLanguage}</Text>
            </View>
          )}
        </View>

        {/* Settings & Logout */}
        <View style={styles.section}>
          <M3Pressable style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingItemInner}>
              <View style={styles.settingIconDanger}>
                <LogOut size={20} color={Colors.danger} />
              </View>
              <Text style={[styles.settingText, { color: Colors.danger }]}>Logout</Text>
            </View>
          </M3Pressable>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <M3Pressable
              style={styles.buttonSecondary}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </M3Pressable>
            <M3Pressable
              style={styles.buttonPrimary}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </M3Pressable>
          </View>
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
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 140,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.onPrimary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  editInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: 6,
    marginBottom: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  heatMapContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysColumn: {
    justifyContent: 'space-between',
    height: 122,
    paddingVertical: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    height: 14,
    lineHeight: 14,
  },
  heatMapGrid: {
    gap: 4,
    paddingRight: 12,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 4,
  },
  heatMapCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLang: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  langText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeLangText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  langBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  langBadgeText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    gap: 20,
  },
  statsCircleContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  statCircleText: {
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  totalSubText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  difficultyBreakdown: {
    flex: 1,
    gap: 10,
  },
  diffRow: {
    gap: 4,
  },
  diffLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  diffCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  diffProgressBg: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  diffProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  settingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  settingItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIconDanger: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(242, 184, 181, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 15,
    paddingVertical: 14,
    textAlign: 'center',
    width: '100%',
  },
  buttonSecondaryText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 15,
    paddingVertical: 14,
    textAlign: 'center',
    width: '100%',
  },
});
