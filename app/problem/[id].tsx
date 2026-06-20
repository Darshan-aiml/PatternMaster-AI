import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, UIManager, LayoutAnimation } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { PATTERNS } from '../../data/patterns';
import { useUserStore } from '../../store/useUserStore';
import { CheckCircle, AlertCircle, HelpCircle, Lightbulb, BookOpen, ArrowLeft, Sparkles } from 'lucide-react-native';
import { M3Pressable } from '../../components/M3Pressable';
import { useBackToHome } from '../../hooks/useBackToHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchAIExplanation, AIExplanation } from '../../services/gemini';
import { ActivityIndicator } from 'react-native';
import { deleteAIExplanation, getAIExplanation } from '../../services/database';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProblemScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { solveProblem, markForRevision, unsolveProblem, progress } = useUserStore();

  const [showHint, setShowHint] = useState(false);
  const [showApproach, setShowApproach] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Handle hardware back button redirection to '/'
  useBackToHome();

  const { problem, pattern } = useMemo(() => {
    for (const pat of PATTERNS) {
      const found = pat.problems.find(pr => pr.id === id);
      if (found) {
        return { problem: found, pattern: pat };
      }
    }
    return { problem: undefined, pattern: undefined };
  }, [id]);

  const { profile } = useUserStore();
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);
  const [selectedAiTab, setSelectedAiTab] = useState<keyof AIExplanation>('patternRecognition');
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Tab labels for UI display
  const tabLabels = {
    patternRecognition: 'Pattern Recognition',
    stepByStep: 'Step-by-Step Thinking',
    interviewPerspective: 'Interview Insights',
    complexityAnalysis: 'Complexity Analysis',
    commonMistakes: 'Common Mistakes',
    optimalSolution: 'Optimal Solution',
    codeExplanation: 'Code Explanation'
  };

  // Load cached AI explanation on mount
  useEffect(() => {
    const checkCache = async () => {
      if (problem?.id) {
        const cached = await getAIExplanation(problem.id);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const looksOffline = typeof parsed?.patternRecognition === 'string'
              && parsed.patternRecognition.toLowerCase().includes('offline walkthrough');

            if (looksOffline) {
              await deleteAIExplanation(problem.id);
              return;
            }

            setAiExplanation(parsed);
          } catch (e) {
            console.error('Failed to parse cached explanation', e);
          }
        }
      }
    };
    checkCache();
  }, [problem?.id]);

  const handleFetchAI = async () => {
    if (!problem) return;
    setLoadingAI(true);
    setErrorAI(null);
    try {
      const result = await fetchAIExplanation(
        { title: problem.title, statement: problem.statement, id: problem.id },
        profile?.preferredLanguage || 'Python'
      );
      setAiExplanation(result);
    } catch (e: any) {
      console.error(e);
      setErrorAI(e.message || 'Failed to fetch AI explanation');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleTriggerAI = () => {
    LayoutAnimation.configureNext(springLayoutConfig);
    setShowAiPanel(!showAiPanel);
  };


  const problemProgress = progress[id];
  const isSolved = problemProgress?.status === 'solved';
  const needsRevision = problemProgress?.status === 'needs-revision';
  const masteryLevel = problemProgress?.masteryLevel || 0;

  if (!problem || !pattern) {
    return (
      <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Problem not found</Text>
        </View>
      </View>
    );
  }

  const handleMarkSolved = async () => {
    await solveProblem(problem.id);
  };

  const handleMarkForRevision = async () => {
    await markForRevision(problem.id);
  };

  const handleMarkUnsolved = async () => {
    await unsolveProblem(problem.id);
  };


  const springLayoutConfig = {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.8,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.8,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.8,
    },
  };

  // Toggle reveal states with smooth spring LayoutAnimation
  const toggleHint = () => {
    LayoutAnimation.configureNext(springLayoutConfig);
    setShowHint(!showHint);
  };

  const toggleApproach = () => {
    LayoutAnimation.configureNext(springLayoutConfig);
    setShowApproach(!showApproach);
  };

  const toggleSolution = () => {
    LayoutAnimation.configureNext(springLayoutConfig);
    setShowSolution(!showSolution);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 24 }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
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
        <Text style={styles.patternTag} numberOfLines={1}>{pattern.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{problem.title}</Text>
          <View style={styles.metaInfo}>
            <View style={[styles.difficultyBadge, styles[problem.difficulty.toLowerCase()]]}>
              <Text style={styles.difficultyText}>{problem.difficulty}</Text>
            </View>
            {masteryLevel > 0 && (
              <View style={styles.masteryBadge}>
                <Text style={styles.masteryText}>{masteryLevel}% Mastery</Text>
              </View>
            )}
          </View>
        </View>

        {/* Problem Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Statement</Text>
          <Text style={styles.text}>{problem.statement}</Text>
        </View>

        {/* Input/Output Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input & Output Specifications</Text>
          <View style={styles.specContainer}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Input Type</Text>
              <Text style={styles.specValue}>{problem.inputType}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Input Length</Text>
              <Text style={styles.specValue}>{problem.inputLength}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Output Length</Text>
              <Text style={styles.specValue}>{problem.outputLength}</Text>
            </View>
            
            <Text style={[styles.specSubTitle, { marginTop: 10 }]}>Sample Input</Text>
            <View style={styles.codeSnippet}>
              <Text style={styles.codeSnippetText}>{problem.sampleInput}</Text>
            </View>

            <Text style={[styles.specSubTitle, { marginTop: 10 }]}>Sample Output</Text>
            <View style={styles.codeSnippet}>
              <Text style={styles.codeSnippetText}>{problem.sampleOutput}</Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <M3Pressable
            style={[styles.controlButton, showHint && styles.controlButtonActive]}
            onPress={toggleHint}
          >
            <View style={styles.controlInner}>
              <HelpCircle color={showHint ? Colors.primary : Colors.textSecondary} size={18} />
              <Text style={[styles.controlText, showHint && styles.controlTextActive]}>Hint</Text>
            </View>
          </M3Pressable>

          <M3Pressable
            style={[styles.controlButton, showApproach && styles.controlButtonActive]}
            onPress={toggleApproach}
          >
            <View style={styles.controlInner}>
              <Lightbulb color={showApproach ? Colors.primary : Colors.textSecondary} size={18} />
              <Text style={[styles.controlText, showApproach && styles.controlTextActive]}>Approach</Text>
            </View>
          </M3Pressable>

          <M3Pressable
            style={[styles.controlButton, showSolution && styles.controlButtonActive]}
            onPress={toggleSolution}
          >
            <View style={styles.controlInner}>
              <BookOpen color={showSolution ? Colors.primary : Colors.textSecondary} size={18} />
              <Text style={[styles.controlText, showSolution && styles.controlTextActive]}>Solution</Text>
            </View>
          </M3Pressable>
        </View>

        {/* AI Mentor Card */}
        <M3Pressable
          style={[styles.aiMentorCard, showAiPanel && styles.aiMentorCardActive]}
          onPress={handleTriggerAI}
        >
          <View style={styles.aiMentorCardInner}>
            <Sparkles color={showAiPanel ? Colors.primary : Colors.textSecondary} size={20} />
            <Text style={[styles.aiMentorCardText, showAiPanel && styles.aiMentorCardTextActive]}>
              Explain Like Interviewer
            </Text>
          </View>
        </M3Pressable>

        {/* AI Explanation Box */}
        {showAiPanel && (
          <View style={styles.aiContainer}>
            {loadingAI ? (
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.aiLoadingText}>Generating AI walkthrough...</Text>
              </View>
            ) : errorAI ? (
              <View style={styles.aiErrorContainer}>
                <Text style={styles.aiErrorText}>{errorAI}</Text>
                <M3Pressable style={styles.aiRetryButton} onPress={() => handleFetchAI()}>
                  <Text style={styles.aiRetryButtonText}>Retry Generation</Text>
                </M3Pressable>
              </View>
            ) : aiExplanation ? (
              <View>
                {/* Tab Selector */}
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tabSelector} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                  {Object.keys(tabLabels).map((tabKey) => (
                    <M3Pressable
                      key={tabKey}
                      style={[styles.tabButton, selectedAiTab === tabKey && styles.tabButtonActive]}
                      onPress={() => setSelectedAiTab(tabKey as any)}
                    >
                      <Text style={[styles.tabButtonText, selectedAiTab === tabKey && styles.tabButtonTextActive]}>
                        {tabLabels[tabKey as keyof typeof tabLabels]}
                      </Text>
                    </M3Pressable>
                  ))}
                </ScrollView>

                {/* Tab Content */}
                <View style={styles.tabContentContainer}>
                  <Text style={styles.tabContentText}>
                    {aiExplanation[selectedAiTab]}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <M3Pressable style={styles.aiSetupButton} onPress={() => handleFetchAI()}>
                  <Text style={styles.aiSetupButtonText}>Generate Walkthrough</Text>
                </M3Pressable>
              </View>
            )}
          </View>
        )}

        {/* Hint Section */}
        {showHint && (
          <View style={styles.revealBox}>
            <View style={styles.revealHeader}>
              <HelpCircle color={Colors.primary} size={18} />
              <Text style={styles.revealTitle}>Hint</Text>
            </View>
            <Text style={styles.revealText}>{problem.hints[0]}</Text>
          </View>
        )}

        {/* Approach Section */}
        {showApproach && (
          <View style={styles.revealBox}>
            <View style={styles.revealHeader}>
              <Lightbulb color={Colors.primary} size={18} />
              <Text style={styles.revealTitle}>The Approach</Text>
            </View>
            <Text style={styles.revealText}>{problem.approach}</Text>
          </View>
        )}

        {/* Solution Section */}
        {showSolution && (
          <View style={styles.revealBox}>
            <View style={styles.revealHeader}>
              <BookOpen color={Colors.primary} size={18} />
              <Text style={styles.revealTitle}>Optimized Solution</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{problem.solution}</Text>
            </View>
            <View style={styles.complexityRow}>
              <View style={styles.complexityItem}>
                <Text style={styles.complexityLabel}>Time Complexity</Text>
                <Text style={styles.complexityValue}>{problem.complexity.time}</Text>
              </View>
              <View style={styles.complexityItem}>
                <Text style={styles.complexityLabel}>Space Complexity</Text>
                <Text style={styles.complexityValue}>{problem.complexity.space}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isSolved && (
            <M3Pressable style={styles.primaryButton} onPress={handleMarkSolved}>
              <View style={styles.buttonInner}>
                <CheckCircle color={Colors.onPrimary} size={20} />
                <Text style={styles.primaryButtonText}>Mark as Solved</Text>
              </View>
            </M3Pressable>
          )}

          {isSolved && (
            <View style={{ gap: 12, width: '100%' }}>
              <View style={styles.solvedContainerBadge}>
                <CheckCircle color={Colors.success} size={20} />
                <Text style={styles.solvedBadgeText}>✓ Solved & Mastered</Text>
              </View>
              <M3Pressable style={styles.deselectButton} onPress={handleMarkUnsolved}>
                <View style={styles.buttonInner}>
                  <Text style={styles.deselectButtonText}>Deselect / Mark Unsolved</Text>
                </View>
              </M3Pressable>
            </View>
          )}

          {!needsRevision && !isSolved && (
            <M3Pressable style={styles.secondaryButton} onPress={handleMarkForRevision}>
              <View style={styles.buttonInner}>
                <AlertCircle color={Colors.warning} size={18} />
                <Text style={styles.secondaryButtonText}>Mark for Revision</Text>
              </View>
            </M3Pressable>
          )}

          {needsRevision && (
            <M3Pressable style={styles.revisionButton} onPress={handleMarkSolved}>
              <View style={styles.buttonInner}>
                <AlertCircle color={Colors.onWarningContainer} size={18} />
                <Text style={styles.revisionButtonText}>Review & Solve Now</Text>
              </View>
            </M3Pressable>
          )}

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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  patternTag: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
  masteryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  masteryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  controlButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  controlButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  controlInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  controlText: {
    marginLeft: 6,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontSize: 13,
  },
  controlTextActive: {
    color: Colors.onPrimaryContainer,
    fontWeight: '700',
  },
  revealBox: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  revealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  revealTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  revealText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#1C1B20',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  codeText: {
    color: '#D0BCFF',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  complexityRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  complexityItem: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  complexityLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  complexityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
    paddingBottom: 120,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  solvedContainerBadge: {
    backgroundColor: Colors.successContainer,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  solvedBadgeText: {
    color: Colors.onSuccessContainer,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 28,
    overflow: 'hidden',
  },
  secondaryButtonText: {
    color: Colors.warning,
    fontSize: 15,
    fontWeight: '700',
  },
  revisionButton: {
    backgroundColor: Colors.warningContainer,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 28,
    overflow: 'hidden',
  },
  revisionButtonText: {
    color: Colors.onWarningContainer,
    fontSize: 15,
    fontWeight: '700',
  },
  deselectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: 28,
    overflow: 'hidden',
  },
  deselectButtonText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  aiMentorCard: {
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  aiMentorCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  aiMentorCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  aiMentorCardText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  aiMentorCardTextActive: {
    color: Colors.onPrimaryContainer,
  },
  aiContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    paddingVertical: 16,
  },
  aiLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  aiLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  aiErrorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  aiErrorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },
  aiRetryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  aiRetryButtonText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  aiSetupContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 14,
  },
  aiSetupText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aiApiKeyInput: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
  },
  aiSetupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSetupButtonText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  tabSelector: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.onPrimary,
  },
  tabContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabContentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  specContainer: {
    backgroundColor: Colors.surfaceVariant,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outline,
    marginTop: 8,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  specLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  specCodeBox: {
    marginTop: 6,
  },
  specSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  codeSnippet: {
    backgroundColor: '#1C1B20',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  codeSnippetText: {
    color: '#D0BCFF',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
