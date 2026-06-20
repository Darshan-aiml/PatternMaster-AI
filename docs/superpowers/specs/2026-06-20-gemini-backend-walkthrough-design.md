# Gemini Backend Walkthrough Design

Date: 2026-06-20

## Goal

Replace direct client-side AI walkthrough generation with a backend-mediated Gemini flow that:
- works for APK users without bundling a provider key in the app
- falls back to local offline walkthroughs when the network is unavailable
- removes the visualization section entirely
- keeps AI output professional plain text with no markdown styling, asterisks, or emoji
- uses tighter token limits and safer request handling

## Architecture

The mobile app will no longer call Gemini or OpenRouter directly. It will call a backend endpoint that owns the Gemini API key in server-side environment variables only.

Primary request path:
1. User taps Generate Walkthrough in the mobile app.
2. The mobile app sends a small JSON request to the backend.
3. The backend builds the Gemini prompt, calls Gemini, validates the response shape, and returns sanitized JSON.
4. The mobile app displays and caches the successful online walkthrough.

Fallback path:
1. If the backend request fails because the device is offline or the request cannot complete, the app generates a local offline walkthrough.
2. Offline walkthroughs are not treated as durable live cache entries that should mask future online responses.

## Backend API

Endpoint:
- `POST /api/walkthrough`

Request body:
- `problemId`
- `title`
- `statement`
- `preferredLanguage`

Response body:
- `patternRecognition`
- `stepByStep`
- `interviewPerspective`
- `complexityAnalysis`
- `commonMistakes`
- `optimalSolution`
- `codeExplanation`

The backend will reject malformed requests and will not expose raw Gemini provider responses directly to the client.

## Prompt and Output Rules

The backend prompt will:
- ask Gemini for interview-style reasoning
- require plain professional text only
- forbid markdown, asterisks, emoji, and decorative formatting
- omit visualization entirely
- request valid JSON with the exact response keys listed above

The backend will also:
- use a conservative output token limit
- sanitize text fields before returning them
- fail closed if the Gemini payload is incomplete or malformed

## Security Model

The Gemini API key will exist only on the backend as an environment variable.

Security rules:
- never store the Gemini key in mobile source code
- never store the Gemini key in git-tracked config
- never place the Gemini key in the APK build config
- avoid logging secrets, full prompts with secrets, or raw provider payloads unnecessarily
- rate-limit the backend endpoint
- validate request size and input shape

This design is chosen because the app will be shared as an APK and client-bundled keys are extractable.

## Mobile App Changes

The mobile app will:
- replace direct provider calls with a backend API call
- keep the offline walkthrough generator for no-network fallback
- stop expecting a visualization field
- avoid persisting offline walkthroughs as if they were live provider responses
- continue caching successful online walkthroughs locally for faster reloads

## Backend Changes

The backend will:
- add the walkthrough endpoint
- add Gemini service code that builds prompts and calls the provider
- store the Gemini key in server environment configuration
- add lightweight request validation and rate limiting

## Error Handling

Client behavior:
- if backend is reachable and succeeds, show the live walkthrough
- if backend is unreachable or the network is unavailable, show offline fallback
- if backend returns a handled error, show a retry path instead of broken formatting

Backend behavior:
- return sanitized error messages
- do not leak provider secrets or stack traces to clients

## Testing

We will verify:
- online walkthrough generation works through the backend
- offline fallback works when the network is unavailable
- cached offline walkthroughs do not block later online walkthroughs
- visualization is absent from backend and app response handling
- no Gemini key appears in tracked files
- the backend enforces a smaller response budget and valid schema

## Scope Boundaries

Included:
- backend Gemini walkthrough endpoint
- mobile integration with backend
- offline fallback retention
- secure key handling

Not included:
- general chat features
- user-specific AI history in the backend
- multi-provider routing
