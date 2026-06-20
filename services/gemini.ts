import { deleteAIExplanation, getAIExplanation, saveAIExplanation } from './database';
import { PATTERNS } from '../data/patterns';

export interface AIExplanation {
  patternRecognition: string;
  stepByStep: string;
  interviewPerspective: string;
  complexityAnalysis: string;
  commonMistakes: string;
  optimalSolution: string;
  codeExplanation: string;
}

const AI_EXPLANATION_FIELDS: Array<keyof AIExplanation> = [
  'patternRecognition',
  'stepByStep',
  'interviewPerspective',
  'complexityAnalysis',
  'commonMistakes',
  'optimalSolution',
  'codeExplanation',
];

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://127.0.0.1:5001';

const sanitizePlainText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\r\n/g, '\n')
    .replace(/\*\*\*+/g, '')
    .replace(/\*\*/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^[#>\-\u2022]+\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const sanitizeExplanation = (value: Record<string, unknown>): AIExplanation => ({
  patternRecognition: sanitizePlainText(value.patternRecognition),
  stepByStep: sanitizePlainText(value.stepByStep),
  interviewPerspective: sanitizePlainText(value.interviewPerspective),
  complexityAnalysis: sanitizePlainText(value.complexityAnalysis),
  commonMistakes: sanitizePlainText(value.commonMistakes),
  optimalSolution: sanitizePlainText(value.optimalSolution),
  codeExplanation: sanitizePlainText(value.codeExplanation),
});

const isOfflineExplanation = (value: unknown): value is AIExplanation => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.patternRecognition === 'string'
    && candidate.patternRecognition.toLowerCase().includes('offline walkthrough');
};

const isCompleteExplanation = (value: unknown): value is AIExplanation => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return AI_EXPLANATION_FIELDS.every((field) => typeof candidate[field] === 'string' && candidate[field].trim().length > 0);
};

export const generateOfflineWalkthrough = (
  problem: {
    title: string;
    statement: string;
    id: string;
    hints?: string[];
    approach?: string;
    solution?: string;
    complexity?: { time: string; space: string };
  },
  preferredLanguage: string,
): AIExplanation => {
  const hints = problem.hints && problem.hints.length > 0
    ? problem.hints.join('\n')
    : 'Look for constraints that suggest the target time and space complexity.';

  const approach = problem.approach || 'Use the pattern to narrow the search space and avoid redundant work.';
  const solution = problem.solution || '';
  const timeComplexity = problem.complexity?.time || 'O(N)';
  const spaceComplexity = problem.complexity?.space || 'O(1)';

  return {
    patternRecognition: `Offline Walkthrough\n\nThis local fallback explains why the problem "${problem.title}" matches a recognizable algorithmic pattern.\n\nKey clues:\n${hints}`,
    stepByStep: `1. Understand the input constraints and edge cases.\n2. Apply the core pattern logic: ${approach}\n3. Maintain the right pointers or state as the algorithm advances.\n4. Validate the final answer against the target conditions.`,
    interviewPerspective: 'Start with the brute-force idea, explain why it is too slow, then walk the interviewer toward the optimized pattern and its trade-offs.',
    complexityAnalysis: `Time Complexity: ${timeComplexity}\nSpace Complexity: ${spaceComplexity}`,
    commonMistakes: 'Common issues include off-by-one errors, incorrect state updates, and missing edge cases such as empty inputs or single-element inputs.',
    optimalSolution: solution
      ? `Solution in ${preferredLanguage}:\n${solution}`
      : `A local ${preferredLanguage} template is not available for this problem yet.`,
    codeExplanation: 'The optimized solution keeps only the minimum state needed, updates it predictably, and avoids unnecessary repeated work.',
  };
};

const fetchOnlineWalkthrough = async (
  problem: { title: string; statement: string; id: string },
  preferredLanguage: string,
): Promise<AIExplanation> => {
  const response = await fetch(`${API_BASE_URL}/api/walkthrough`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: problem.id,
      title: problem.title,
      statement: problem.statement,
      preferredLanguage,
    }),
  });

  const rawBody = await response.text();
  let parsedBody: Record<string, unknown> = {};

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    throw new Error('Backend returned an unreadable walkthrough response.');
  }

  if (!response.ok) {
    const message = typeof parsedBody.message === 'string'
      ? parsedBody.message
      : 'Walkthrough request failed.';
    throw new Error(message);
  }

  const sanitized = sanitizeExplanation(parsedBody);
  if (!isCompleteExplanation(sanitized)) {
    throw new Error('Backend returned an incomplete walkthrough.');
  }

  return sanitized;
};

export const fetchAIExplanation = async (
  problem: { title: string; statement: string; id: string },
  preferredLanguage: string,
): Promise<AIExplanation> => {
  const cached = await getAIExplanation(problem.id);
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      if (isCompleteExplanation(parsedCache) && !isOfflineExplanation(parsedCache)) {
        return sanitizeExplanation(parsedCache);
      }

      if (isOfflineExplanation(parsedCache)) {
        await deleteAIExplanation(problem.id);
      }
    } catch (error) {
      console.error('Failed to parse cached explanation:', error);
      await deleteAIExplanation(problem.id);
    }
  }

  try {
    const explanation = await fetchOnlineWalkthrough(problem, preferredLanguage);
    await saveAIExplanation(problem.id, JSON.stringify(explanation));
    return explanation;
  } catch (error) {
    const fullProblem = PATTERNS.flatMap((pattern) => pattern.problems).find((entry) => entry.id === problem.id);
    return generateOfflineWalkthrough(fullProblem || problem, preferredLanguage);
  }
};
