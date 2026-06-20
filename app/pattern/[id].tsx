import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { PATTERNS } from '../../data/patterns';
import { Lightbulb, Code, Zap, ArrowLeft } from 'lucide-react-native';
import { M3Pressable } from '../../components/M3Pressable';
import { useBackToHome } from '../../hooks/useBackToHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatternDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pattern = PATTERNS.find(p => p.id === id);

  // Handle hardware back button redirection to '/'
  useBackToHome();

  if (!pattern) {
    return (
      <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pattern not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
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
        <Text style={styles.headerTitle} numberOfLines={1}>Pattern Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>{pattern.name}</Text>
          <Text style={styles.difficulty}>{pattern.difficulty} Difficulty</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.text}>{pattern.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Lightbulb color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Recognition Clues</Text>
          </View>
          <View style={styles.cluesContainer}>
            {pattern.recognitionClues.map((clue, index) => (
              <View key={index} style={styles.clueItem}>
                <View style={styles.dot} />
                <Text style={styles.clueText}>{clue}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Code color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Common Template</Text>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{pattern.template}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Zap color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Problems</Text>
          </View>
          <View style={styles.problemsList}>
            {pattern.problems.map((problem) => (
              <Link href={`/problem/${problem.id}`} key={problem.id} asChild>
                <M3Pressable style={styles.problemCard}>
                  <View style={styles.problemInfo}>
                    <Text style={styles.problemName}>{problem.title}</Text>
                    <Text style={styles.problemDiff}>{problem.difficulty}</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </M3Pressable>
              </Link>
            ))}
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
    paddingBottom: 140,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  hero: {
    backgroundColor: Colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  difficulty: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 6,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  text: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  cluesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  clueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 10,
    marginTop: 8,
  },
  clueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#1C1B20', // deep M3 charcoal code block
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  codeText: {
    color: '#D0BCFF', // lavender accent for templates
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  problemsList: {
    gap: 10,
    paddingBottom: 40,
  },
  problemCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  problemInfo: {
    flex: 1,
  },
  problemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  problemDiff: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

