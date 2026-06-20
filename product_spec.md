# Product Specification & Features Document: PatternMaster AI

This document outlines the functional and non-functional features, UI/UX design patterns, architectural components, and distinctive capabilities implemented in the PatternMaster application.

---

## 1. Functional Features

### A. Personalized Recommendation Engine ("Today's Focus")
*   **Dynamic Problem Suggestion**: Computes a priority score for all uncompleted or decaying problems and displays the top recommendation on the Home Screen.
*   **Personalization Factors**:
    *   *Mastery Level*: Evaluated dynamically based on user progress.
    *   *Last Practiced*: Triggers alert states if user has not solved a pattern recently (spaced repetition).
    *   *Challenge Matching*: Elevates recommended difficulty (Easy -> Medium -> Hard) as the user's pattern mastery improves.
*   **Today's Focus Card**: Displays estimated time, difficulty, pattern category, completion status, and a personalized justification string (e.g., *"You are likely forgetting this pattern"*).

### B. AI Interview Explanation Engine ("Explain Like Interviewer")
*   **Dialogue-Driven Instruction**: Instead of dumping code, the engine models a conversation between a company interviewer and a candidate to guide them to the optimal solution.
*   **8-Module Interface (Tabs)**:
    1.  *Pattern Recognition*: Identifies problem signals and why brute-force is sub-optimal.
    2.  *Step-by-Step Dialogue*: Simulates the guided interview dialogue.
    3.  *Interview Perspective*: Timelines, expectations, and acceptable brute-force approaches.
    4.  *Complexity*: Visual comparison of time/space tradeoffs.
    5.  *Common Mistakes*: Common bugs, off-by-one errors, and boundary issues.
    6.  *Trace Visualization*: Simulates data structure states or pointers step-by-step.
    7.  *Optimal Solution*: Invariants and proof of correctness.
    8.  *Code Context*: High-level intent of the implementation blocks.

### C. Custom & Fallback API Keys
*   **User Profile Setting**: Allows users to input their own Gemini API key for privacy and rate-limit independence, securely stored locally.
*   **Zero-Config Fallback**: Defaults to the app's pre-configured environment variable key (`EXPO_PUBLIC_GEMINI_API_KEY`) if no custom key is provided.

---

## 2. Non-Functional Features

*   **Sub-100ms Load Times (Warm Cache)**: Using local SQLite caching, cached explanations load in **< 50ms**, eliminating loading spinners on repeat visits.
*   **Offline-First Explanations**: Once generated and cached, explanations remain fully readable offline.
*   **Robust JSON Validation**: Boundary-clean regex strips extraneous API outputs and parses strictly formatted JSON.
*   **Zero-Dependency SDK Implementation**: Uses native `fetch` requests directly against the Google REST API endpoint, minimizing the mobile bundle size and dependency overhead.

---

## 3. UI/UX Design & Aesthetic Guidelines

The UI uses premium design elements to create an immersive, gamified DSA workspace:

*   **Color Palette**: Sleek dark mode with tailored colors (deep slate backgrounds, vibrant violet and teal accents for interactive controls, and warm amber for alerts).
*   **Glassmorphic Cards**: Cards use semi-transparent background colors combined with subtle borders to stand out cleanly against dark backdrops.
*   **Tabbed Interface Layout**: The 8 modular tabs are grouped into a scrollable bar. Selecting a tab updates the active view instantly with smooth micro-animations.
*   **Typography Hierarchy**: Clean sans-serif hierarchy (using Outfit or Inter-style system fonts) prioritizing readability for technical documentation and code blocks.

---

## 4. Distinctive Feature: "Dialogue-Driven Instruction"

The primary differentiator of PatternMaster from platforms like LeetCode or NeetCode is the **AI Interviewer Dialogue**. 

Traditional platforms provide static solutions. PatternMaster simulates a dialogue where the interviewer pushes the candidate to optimize from \(O(N^2)\) to \(O(N \log N)\) and finally \(O(N)\). This trains users for actual behavioral and live coding interviews, helping them understand *how* to arrive at the pattern, not just *what* the code is.
