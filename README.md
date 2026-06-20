# PatternMaster

PatternMaster is a React Native mobile application designed to help developers master Data Structures and Algorithms through pattern-based learning. Instead of isolating problems, the platform groups questions by underlying structural patterns and provides optimized algorithmic templates.

## Features

* **Pattern-Based Progression**: Interactive learning paths organized by algorithmic paradigms (e.g., Two Pointers, Sliding Window, Fast and Slow Pointers).
* **Personalized Practice Engine**: Real-time recommendation system that suggests problem sets based on current topic mastery, weak areas, and revision timelines.
* **Onboarding Assessment**: Intake questionnaire to determine the user's initial skill level and customize the learning path.
* **Problem Tracking System**: Comprehensive database of curated questions categorized by difficulty, with hints, input/output samples, optimal approaches, and code solutions.
* **Revision and Spaced Repetition**: Automatic scheduling of weak topics to ensure long-term retention of core problem-solving concepts.
* **Local Persistence**: Integration with SQLite and secure storage for reliable offline progress tracking, user profiles, and active configurations.
* **Live AI Walkthroughs**: Problem explanations are generated online through a backend Gemini service and cached locally after a successful response.

## Technical Stack

* **Core Framework**: Expo (React Native) utilizing Expo Router for file-based navigation.
* **Programming Language**: TypeScript.
* **State Management**: Zustand for global client-side application state and reactive UI bindings.
* **Data Storage**: Expo SQLite for persistent tabular user progress, and Expo Secure Store for private user credentials and local session data.
* **Styling and Layout**: NativeWind (Tailwind CSS integration for React Native) and Lucide React Native for UI icons.

## Environment Setup

Create a local `.env` file from `.env.example` and point the app at your backend:

`EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5001`

Keep Gemini secrets on the backend only. The mobile repository should only contain placeholders or non-sensitive public configuration.

## System Design

PatternMaster uses an MVVM (Model-View-ViewModel) architectural pattern implemented with React components (Views), Zustand stores (ViewModels), and SQLite databases (Models).

```text
+-------------------------------------------------------------+
|                          UI Layer                           |
|      (HomeScreen, OnboardingScreen, ProblemsScreen)         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                       Zustand Store                         |
|      (useUserStore: State & Recommendation Algorithms)      |
+-----------------------+--------------+----------------------+
                        |              |
                        v              v
+-------------------------+          +-------------------------+
|     SQLite Service      |          |    Secure Store API     |
|   (UserProgress DB)     |          | (Credentials & Tokens)  |
+-------------------------+          +-------------------------+
```

1. **View Layer**: Handles user interaction, responsive rendering, and transition animations.
2. **ViewModel Layer (Zustand)**: Manages runtime state, filters problem categories, and calculates real-time recommendations.
3. **Data Layer (SQLite & SecureStore)**: Persists user information, onboarding completion status, and granular problem solving metrics (attempts, last solved timestamps, and topic mastery percentages) locally on the device.

## Evaluation

The recommendation engine calculates a user's mastery level dynamically to prioritize study materials:

1. **Mastery Score Calculation**: Topic mastery starts at 0% and is evaluated per pattern. Successfully solving a problem increases topic mastery by 20% (capped at 100%), while marking a problem for revision reduces the score by 10% (floored at 0%).
2. **Recommendation Logic**:
   * Analyzes current progress datasets to find patterns requiring revision.
   * Identifies the weakest pattern where mastery is below a target threshold.
   * Recommends the next sequential unsolved problem within the identified priority pattern.

## Result

* **Instant Performance**: Client-side state updates execute instantly via Zustand, syncing with local SQLite asynchronously to avoid blocking UI interactions.
* **Robust Session Management**: Secure Store ensures session credentials persist across app restarts and application updates.
* **Fully Offline-Capable**: The curated repository of patterns, problems, solutions, and historical progress is entirely local, ensuring accessibility without cellular connectivity.
