# Gemini Backend Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move walkthrough generation to a backend Gemini endpoint so shared APK users get live walkthroughs without embedding the provider key in the app, while preserving local offline fallback.

**Architecture:** The Express backend will expose a public `POST /api/walkthrough` endpoint that validates input, calls Gemini with a strict JSON schema, sanitizes the output, and returns a reduced walkthrough payload without visualization. The Expo app will call that backend endpoint, cache only successful online responses, and generate a local offline walkthrough only when the network request fails.

**Tech Stack:** Expo React Native, TypeScript, Express, dotenv, Gemini REST API, expo-sqlite, expo-secure-store

## Global Constraints

- Use Gemini throughout the app and remove OpenRouter from the walkthrough path.
- Fall back to local offline walkthroughs only when the device is offline or the network request cannot complete.
- Remove the `visualization` field from request handling, response handling, caching, and UI.
- Keep all AI output in professional plain text with no markdown styling, no asterisks, and no emoji.
- Keep the Gemini API key out of git-tracked files, mobile source code, and APK build config.
- Use conservative output token limits and safer request handling on the backend.

---

### Task 1: Add backend Gemini walkthrough service

**Files:**
- Create: `backend/src/services/geminiWalkthrough.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: `process.env.GEMINI_API_KEY`, `problemId: string`, `title: string`, `statement: string`, `preferredLanguage: string`
- Produces: `generateWalkthrough(input: WalkthroughRequest): Promise<WalkthroughResponse>`

- [ ] **Step 1: Write the failing type-first smoke test command**

Run: `npm --prefix backend run build`
Expected: FAIL after route wiring in later tasks if `generateWalkthrough` is referenced before implementation.

- [ ] **Step 2: Create the Gemini service with exact interfaces**

```ts
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

export async function generateWalkthrough(input: WalkthroughRequest): Promise<WalkthroughResponse> {
  // implementation
}
```

- [ ] **Step 3: Implement minimal Gemini request logic**

```ts
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 900,
    },
  }),
});
```

- [ ] **Step 4: Add response sanitizing and schema validation**

```ts
const requiredKeys = [
  'patternRecognition',
  'stepByStep',
  'interviewPerspective',
  'complexityAnalysis',
  'commonMistakes',
  'optimalSolution',
  'codeExplanation',
] as const;
```

- [ ] **Step 5: Run backend build to verify it passes**

Run: `npm --prefix backend run build`
Expected: PASS with `dist/` output created and no TypeScript errors from the new service.

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/geminiWalkthrough.ts backend/package.json
git commit -m "feat: add backend Gemini walkthrough service"
```

### Task 2: Expose public walkthrough API endpoint with safe validation

**Files:**
- Modify: `backend/src/routes/api.ts`
- Modify: `backend/src/index.ts`
- Modify: `backend/src/middleware/rateLimiter.ts`

**Interfaces:**
- Consumes: `generateWalkthrough(input: WalkthroughRequest): Promise<WalkthroughResponse>`
- Produces: `POST /api/walkthrough`

- [ ] **Step 1: Write the failing integration target**

Run: `npm --prefix backend run build`
Expected: FAIL once `api.ts` references `generateWalkthrough` before the route body is completed.

- [ ] **Step 2: Add request validation in `backend/src/routes/api.ts`**

```ts
const isValidWalkthroughBody = (body: any): body is WalkthroughRequest => {
  return typeof body?.problemId === 'string'
    && typeof body?.title === 'string'
    && typeof body?.statement === 'string'
    && typeof body?.preferredLanguage === 'string';
};
```

- [ ] **Step 3: Add the public walkthrough route**

```ts
router.post('/walkthrough', async (req, res, next) => {
  try {
    if (!isValidWalkthroughBody(req.body)) {
      return res.status(400).json({ message: 'Invalid walkthrough request.' });
    }

    const walkthrough = await generateWalkthrough(req.body);
    return res.json(walkthrough);
  } catch (error) {
    return next(error);
  }
});
```

- [ ] **Step 4: Tighten backend error copy and JSON limits**

```ts
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
```

- [ ] **Step 5: Add a dedicated walkthrough rate limiter**

```ts
export const walkthroughRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
```

- [ ] **Step 6: Run backend build to verify it passes**

Run: `npm --prefix backend run build`
Expected: PASS and `POST /api/walkthrough` compiles cleanly.

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/api.ts backend/src/index.ts backend/src/middleware/rateLimiter.ts
git commit -m "feat: add walkthrough API endpoint"
```

### Task 3: Refactor mobile walkthrough service to backend-plus-offline mode

**Files:**
- Modify: `services/gemini.ts`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: `POST /api/walkthrough`, `saveAIExplanation(problemId: string, explanation: string)`, `getAIExplanation(problemId: string)`, `deleteAIExplanation(problemId: string)`
- Produces: `fetchAIExplanation(problem, preferredLanguage): Promise<AIExplanation>`

- [ ] **Step 1: Write the failing type target**

Run: `npx tsc --noEmit`
Expected: FAIL after removing `visualization` from `AIExplanation` until all consumers are updated.

- [ ] **Step 2: Shrink the mobile walkthrough schema**

```ts
export interface AIExplanation {
  patternRecognition: string;
  stepByStep: string;
  interviewPerspective: string;
  complexityAnalysis: string;
  commonMistakes: string;
  optimalSolution: string;
  codeExplanation: string;
}
```

- [ ] **Step 3: Replace direct provider calls with backend fetch**

```ts
const response = await fetch(`${apiBaseUrl}/api/walkthrough`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problemId: problem.id,
    title: problem.title,
    statement: problem.statement,
    preferredLanguage,
  }),
});
```

- [ ] **Step 4: Keep offline fallback only for network failures**

```ts
catch (error) {
  const offlineExplanation = generateOfflineWalkthrough(fullProblem || problem, preferredLanguage);
  return offlineExplanation;
}
```

- [ ] **Step 5: Update docs and env placeholders**

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5001
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

- [ ] **Step 6: Run app type check to verify it passes**

Run: `npx tsc --noEmit`
Expected: PASS or, if Expo full-graph checking is slow, no new errors from `services/gemini.ts`.

- [ ] **Step 7: Commit**

```bash
git add services/gemini.ts .env.example README.md
git commit -m "feat: switch app walkthroughs to backend Gemini"
```

### Task 4: Update the walkthrough screen and cache behavior

**Files:**
- Modify: `app/problem/[id].tsx`
- Modify: `services/database.ts`

**Interfaces:**
- Consumes: `fetchAIExplanation(problem, preferredLanguage): Promise<AIExplanation>`
- Produces: Walkthrough UI without `visualization`, cached online responses only

- [ ] **Step 1: Write the failing type target**

Run: `npx tsc --noEmit`
Expected: FAIL while the screen still references the removed `visualization` tab.

- [ ] **Step 2: Remove the visualization tab and labels**

```ts
const tabLabels = {
  patternRecognition: 'Pattern Recognition',
  stepByStep: 'Step-by-Step Thinking',
  interviewPerspective: 'Interview Insights',
  complexityAnalysis: 'Complexity Analysis',
  commonMistakes: 'Common Mistakes',
  optimalSolution: 'Optimal Solution',
  codeExplanation: 'Code Explanation',
};
```

- [ ] **Step 3: Keep stale offline cache clearing**

```ts
const looksOffline = typeof parsed?.patternRecognition === 'string'
  && parsed.patternRecognition.toLowerCase().includes('offline walkthrough');
```

- [ ] **Step 4: Ensure offline fallbacks are not re-saved as live cache entries**

```ts
export const deleteAIExplanation = async (problemId: string) => {
  await db.runAsync('DELETE FROM ai_explanations WHERE problemId = ?', [problemId]);
};
```

- [ ] **Step 5: Run app type check to verify it passes**

Run: `npx tsc --noEmit`
Expected: PASS or no new errors from `app/problem/[id].tsx` and `services/database.ts`.

- [ ] **Step 6: Commit**

```bash
git add app/problem/[id].tsx services/database.ts
git commit -m "feat: update walkthrough UI for backend response"
```

### Task 5: Verify keys stay out of tracked files

**Files:**
- Modify: `eas.json`
- Modify: `.gitignore` if needed

**Interfaces:**
- Consumes: `GEMINI_API_KEY` on backend only, `EXPO_PUBLIC_API_BASE_URL` on mobile only
- Produces: tracked config with no provider secret

- [ ] **Step 1: Remove client-side provider env usage from tracked config**

```json
{
  "env": {
    "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "..."
  }
}
```

- [ ] **Step 2: Verify no Gemini key remains in tracked files**

Run: `rg -n "AQ\\.|GEMINI_API_KEY|OPENROUTER_API_KEY" .`
Expected: only safe placeholders, backend env variable references, or documentation text without actual secrets.

- [ ] **Step 3: Run backend build and app type check once more**

Run: `npm --prefix backend run build`
Expected: PASS

Run: `npx tsc --noEmit`
Expected: PASS or no newly introduced app errors.

- [ ] **Step 4: Commit**

```bash
git add eas.json .gitignore README.md .env.example
git commit -m "chore: secure walkthrough configuration"
```
