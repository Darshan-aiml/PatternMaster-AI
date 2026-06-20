export interface WalkthroughRequest {
  problemId: string;
  title: string;
  statement: string;
  preferredLanguage: string;
}

export interface WalkthroughResponse {
  patternRecognition: string;
  stepByStep: string;
  interviewPerspective: string;
  complexityAnalysis: string;
  commonMistakes: string;
  optimalSolution: string;
  codeExplanation: string;
}

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const RESPONSE_KEYS: Array<keyof WalkthroughResponse> = [
  'patternRecognition',
  'stepByStep',
  'interviewPerspective',
  'complexityAnalysis',
  'commonMistakes',
  'optimalSolution',
  'codeExplanation',
];

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

const buildPrompt = (input: WalkthroughRequest): string => `You are a senior software engineer conducting a data structures and algorithms interview at a top product company.
Your job is to teach the candidate how to reason clearly and efficiently.
Generate a polished interviewer-style walkthrough for the problem "${input.title}".
Problem statement: "${input.statement}".
Preferred programming language: "${input.preferredLanguage}".

Formatting rules:
Use professional plain text only.
Do not use markdown.
Do not use asterisks.
Do not use emoji.
Do not include a visualization section.
Keep each section concise, practical, and interview-ready.

Return valid JSON only with this exact shape:
{
  "patternRecognition": "Why this pattern fits the problem.",
  "stepByStep": "How to think through the solution in order.",
  "interviewPerspective": "How an interviewer would evaluate the approach and likely follow-ups.",
  "complexityAnalysis": "Time and space complexity with justification.",
  "commonMistakes": "Typical mistakes and edge cases.",
  "optimalSolution": "The best solution in the preferred programming language.",
  "codeExplanation": "A line-by-line explanation of the optimal solution."
}`;

const extractJsonObject = (responseText: string): string => {
  const cleanedText = responseText.trim();
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Gemini returned a non-JSON response.');
  }

  return cleanedText.slice(firstBrace, lastBrace + 1);
};

const parseGeminiResponse = async (response: Response): Promise<WalkthroughResponse> => {
  const rawBody = await response.text();

  if (!response.ok) {
    let details = 'Gemini request failed.';
    try {
      const parsed = JSON.parse(rawBody);
      details = parsed.error?.message || details;
    } catch {
      // Keep default message.
    }
    throw new Error(details);
  }

  let content = '';
  try {
    const parsed = JSON.parse(rawBody);
    content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    throw new Error('Gemini returned an unreadable response payload.');
  }

  const jsonText = extractJsonObject(content);
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  const sanitized: WalkthroughResponse = {
    patternRecognition: sanitizePlainText(parsed.patternRecognition),
    stepByStep: sanitizePlainText(parsed.stepByStep),
    interviewPerspective: sanitizePlainText(parsed.interviewPerspective),
    complexityAnalysis: sanitizePlainText(parsed.complexityAnalysis),
    commonMistakes: sanitizePlainText(parsed.commonMistakes),
    optimalSolution: sanitizePlainText(parsed.optimalSolution),
    codeExplanation: sanitizePlainText(parsed.codeExplanation),
  };

  const hasAllFields = RESPONSE_KEYS.every((key) => sanitized[key].length > 0);
  if (!hasAllFields) {
    throw new Error('Gemini returned an incomplete walkthrough.');
  }

  return sanitized;
};

export async function generateWalkthrough(input: WalkthroughRequest): Promise<WalkthroughResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Gemini service is not configured on the server.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8000,
      },
    }),
  });

  return parseGeminiResponse(response);
}
