import { saveAIExplanation, getAIExplanation } from './database';
import { PATTERNS } from '../data/patterns';

export interface AIExplanation {
  patternRecognition: string;
  stepByStep: string;
  interviewPerspective: string;
  complexityAnalysis: string;
  commonMistakes: string;
  visualization: string;
  optimalSolution: string;
  codeExplanation: string;
}

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
  preferredLanguage: string
): AIExplanation => {
  const hints = problem.hints && problem.hints.length > 0
    ? problem.hints.map(h => `- ${h}`).join('\n')
    : 'Look for constraints that indicate target time/space complexity.';
  
  const approach = problem.approach || 'Use the relevant pattern to narrow down search spaces or avoid duplicate work.';
  const solution = problem.solution || '';
  const timeComplexity = problem.complexity?.time || 'O(N)';
  const spaceComplexity = problem.complexity?.space || 'O(1)';

  return {
    patternRecognition: `Offline Walkthrough

The problem "${problem.title}" is solved using pattern recognition.

Key approach indicators:
${hints}

Avoid standard brute-force nested O(N2) iterations by leveraging the structured properties of the inputs.`,

    stepByStep: `Interviewer Approach Walkthrough (Offline Mode):

1. Understand Constraints: Identify edge cases like empty inputs, null pointers, or single-element inputs.
2. Apply Core Pattern Logic:
   ${approach}
3. Pointers and Data Structures Maintenance: Update markers correctly to progress towards the terminal condition.
4. Result Verification: Collect and return values matching target constraints.`,

    interviewPerspective: `Interview Insights:
- Brute Force First: Start by explaining the naive approach, pointing out its inefficiency (e.g. O(N2)).
- Communication: Walk the interviewer through your logic as you trace the sample inputs.
- Edge Cases: Ask: How do we handle empty lists? What if there are multiple valid solutions?`,

    complexityAnalysis: `Complexity Analysis:
- Time Complexity: ${timeComplexity} - The optimized pattern guarantees we only traverse elements a minimal number of times.
- Space Complexity: ${spaceComplexity} - We use minimal auxiliary memory (e.g., constant space for pointers).`,

    commonMistakes: `Pitfalls and Mistakes:
- Loop Bounds: Watch out for off-by-one errors when managing bounds.
- Data Mutation: Be careful not to mutate inputs unnecessarily if the environment expects read-only processing.
- Edge Inputs: Missing checks for single-item collections or empty parameters.`,

    visualization: `Conceptual Flow:

[Input Data] ---> [Process via Pattern Optimization] ---> [Condition Matched?]
                         ^                                     |
                         |-- [Update Pointers/States] <-- (No) v (Yes)
                                                               [Return Result]
`,

    optimalSolution: solution
      ? `// Translating solution to ${preferredLanguage} style\n${solution}`
      : `// No local template solution found. Refer to the problem approach.`,

    codeExplanation: `Optimal Walkthrough:
- By following the pattern logic, we reduce complexity.
- Auxiliary variables/structures track current progress to avoid redundant scans.
- This represents the optimal approach expected during a live coding round.`
  };
};

export const fetchAIExplanation = async (
  problem: { title: string; statement: string; id: string },
  preferredLanguage: string,
  apiKey?: string
): Promise<AIExplanation> => {
  // Check cache first
  const cached = await getAIExplanation(problem.id);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached explanation:', e);
    }
  }

  const prompt = `You are a senior software engineer conducting a DSA interview at a top product company.
Your task is to teach the candidate how to think.
Guide the candidate through the problem "${problem.title}" with statement "${problem.statement}".
The candidate is using "${preferredLanguage}".

For each section, provide detailed, high-quality, but concise explanations (avoid fluff to keep the response time fast). 
Do NOT use emojis, bold text markers (like asterisks **, ***), markdown formatting headers, or markdown styling inside the string fields. The output must be written in clean, professional plain-text format.

You MUST return your response as a valid JSON object matching the following structure EXACTLY:
{
  "patternRecognition": "Detailed explanation of why this pattern applies...",
  "stepByStep": "Step-by-step logic of how to approach solving it...",
  "interviewPerspective": "How this problem is viewed in interviews, typical follow-ups...",
  "complexityAnalysis": "Detailed Time and Space complexity breakdown...",
  "commonMistakes": "Common pitfalls and edge cases candidates miss...",
  "visualization": "Text or ASCII-based diagram visualizing the core technique...",
  "optimalSolution": "The cleanest optimal code snippet...",
  "codeExplanation": "Walkthrough of the optimal code snippet line-by-line..."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return only the raw JSON string.`;

  const openRouterKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || (typeof window === 'undefined' ? process.env.OPENROUTER_API_KEY : '');
  const huggingFaceKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || (typeof window === 'undefined' ? process.env.HUGGINGFACE_API_KEY : '');
  const geminiKey = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AQ.Ab8RN6LlDw5o5EiUhXw4A3DOTv6UazCyi0DnD8Jz9ClcpuVjdw';

  let textResponse = '';

  // 1. Try OpenRouter if key is available
  if (openRouterKey) {
    try {
      console.log('Attempting AI Explanation generation via OpenRouter...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        textResponse = data.choices?.[0]?.message?.content || '';
      } else {
        console.warn(`OpenRouter request failed with status: ${response.status}`);
      }
    } catch (e) {
      console.warn('OpenRouter fetch error:', e);
    }
  }

  // 2. Try Hugging Face if key is available and OpenRouter failed
  if (!textResponse && huggingFaceKey) {
    try {
      console.log('Attempting AI Explanation generation via Hugging Face...');
      // Using Qwen/Qwen2.5-72B-Instruct which is excellent at instruction-following and JSON formatting
      const response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${huggingFaceKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        textResponse = data.choices?.[0]?.message?.content || '';
      } else {
        console.warn(`Hugging Face request failed with status: ${response.status}`);
      }
    } catch (e) {
      console.warn('Hugging Face fetch error:', e);
    }
  }

  // 3. Fallback to Gemini API if available and previous steps failed
  if (!textResponse && geminiKey) {
    try {
      console.log('Attempting AI Explanation generation via Gemini API...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                patternRecognition: { type: 'STRING' },
                stepByStep: { type: 'STRING' },
                interviewPerspective: { type: 'STRING' },
                complexityAnalysis: { type: 'STRING' },
                commonMistakes: { type: 'STRING' },
                visualization: { type: 'STRING' },
                optimalSolution: { type: 'STRING' },
                codeExplanation: { type: 'STRING' }
              },
              required: [
                'patternRecognition',
                'stepByStep',
                'interviewPerspective',
                'complexityAnalysis',
                'commonMistakes',
                'visualization',
                'optimalSolution',
                'codeExplanation'
              ]
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        console.warn(`Gemini API request failed with status: ${response.status}`);
      }
    } catch (e) {
      console.warn('Gemini fetch error:', e);
    }
  }

  if (!textResponse) {
    console.log('No LLM keys configured or all requests failed. Falling back to offline generation...');
    const fullProblem = PATTERNS.flatMap(pat => pat.problems).find(p => p.id === problem.id);
    const offlineExplanation = generateOfflineWalkthrough(fullProblem || problem, preferredLanguage);
    
    // Cache the offline version so it loads instantly next time
    await saveAIExplanation(problem.id, JSON.stringify(offlineExplanation));
    return offlineExplanation;
  }

  // Extract JSON block in case of trailing text
  let cleanedText = textResponse.trim();
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleanedText);
    // Cache it
    await saveAIExplanation(problem.id, JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    console.error('Invalid JSON returned by LLM API. Original text:', textResponse);
    console.error('Cleaned text attempt:', cleanedText);
    throw new Error('LLM API returned invalid JSON output');
  }
};
