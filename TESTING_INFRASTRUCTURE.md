# Test/Practice Infrastructure

## Overview
This document describes the reusable infrastructure for creating test/practice pages in the Math Place app.

## Benefits
- **No code duplication** - Common logic is centralized
- **Automatic result saving** - Test results are automatically saved to localStorage
- **Consistent UI** - All tests have the same look and feel
- **Easy to add new tests** - Just focus on question generation and answer checking

## Components

### 1. `useTestSession` Hook
Manages all common test session logic:
- Score tracking
- Timer management
- User authentication
- Automatic result saving

**Usage:**
```typescript
import { useTestSession } from '../hooks/useTestSession';

const { state, actions, currentUser } = useTestSession({
  testType: 'multiplication', // or 'fraction', 'addition', etc.
  maxQuestions: 10,
  difficulty: 3,
  requireAuth: true, // optional, defaults to true
});

// Available state
state.score          // Current score
state.totalQuestions // Total questions answered
state.elapsedTime    // Time in seconds
state.isTimerRunning // Timer status
state.isGameComplete // Test completion status
state.percentage     // Current percentage

// Available actions
actions.incrementScore()   // Add 1 to score
actions.incrementTotal()   // Add 1 to total questions
actions.startTimer()       // Start the timer
actions.stopTimer()        // Stop the timer
actions.completeTest()     // Mark test complete & auto-save results
actions.resetSession()     // Reset all state
```

### 2. Utility Functions (`utils/testHelpers.ts`)

```typescript
import { formatTime, getScoreColorScheme, shuffleArray } from '../utils/testHelpers';

// Format seconds to "5m 32s" or "1h 15m 30s"
formatTime(332)  // "5m 32s"

// Get Chakra UI color scheme based on percentage
getScoreColorScheme(85)  // "green"
getScoreColorScheme(65)  // "yellow"

// Shuffle an array
shuffleArray([1, 2, 3, 4])  // [3, 1, 4, 2]

// More utilities available...
```

### 3. Common Components

#### `TestCompleteScreen`
Pre-built completion screen with score, percentage, time display.

```typescript
import TestCompleteScreen from '../components/TestCompleteScreen';

<TestCompleteScreen
  score={8}
  totalQuestions={10}
  percentage={80}
  elapsedTime={120}
  testType="multiplication"
  onRestart={() => resetTest()}
  colorScheme="purple"
/>
```

#### `DifficultySelector`
Pre-built question count and difficulty selection screen.

```typescript
import DifficultySelector from '../components/DifficultySelector';

<DifficultySelector
  testTitle={t('multiplicationTable.title')}
  testBadge={t('practicePage.subjects.multiplication')}
  colorScheme="red"
  questionOptions={[5, 10, 15, 20, 25]}
  onStart={(count, difficulty) => startGame(count, difficulty)}
/>
```

## Example: Creating a New Test Page

```typescript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTestSession } from '../hooks/useTestSession';
import { formatTimeMinSec } from '../utils/testHelpers';
import TestCompleteScreen from '../components/TestCompleteScreen';
import DifficultySelector from '../components/DifficultySelector';

export default function MyNewTest() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<{ count: number; difficulty: number } | null>(null);
  
  const { state, actions } = useTestSession({
    testType: 'myNewTest',
    maxQuestions: config?.count || 10,
    difficulty: config?.difficulty || 1,
  });

  // Your custom logic
  const [currentQuestion, setCurrentQuestion] = useState(generateQuestion());

  const handleStartGame = (count: number, difficulty: number) => {
    setConfig({ count, difficulty });
    actions.startTimer();
    // Initialize your test...
  };

  const handleAnswer = (answer: number) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      actions.incrementScore();
    }
    actions.incrementTotal();

    // Check if test is complete
    if (state.totalQuestions + 1 >= config!.count) {
      actions.completeTest(); // Automatically saves results!
    } else {
      setCurrentQuestion(generateQuestion());
    }
  };

  // Show difficulty selector if not started
  if (!config) {
    return (
      <DifficultySelector
        testTitle={t('myNewTest.title')}
        testBadge={t('practicePage.subjects.mySubject')}
        onStart={handleStartGame}
      />
    );
  }

  // Show completion screen
  if (state.isGameComplete) {
    return (
      <TestCompleteScreen
        score={state.score}
        totalQuestions={state.totalQuestions}
        percentage={state.percentage}
        elapsedTime={state.elapsedTime}
        testType="myNewTest"
        onRestart={() => {
          setConfig(null);
          actions.resetSession();
        }}
      />
    );
  }

  // Main game UI
  return (
    <div>
      <p>Score: {state.score}/{state.totalQuestions}</p>
      <p>Time: {formatTimeMinSec(state.elapsedTime)}</p>
      <p>Question: {currentQuestion.text}</p>
      <button onClick={() => handleAnswer(userAnswer)}>Submit</button>
    </div>
  );
}
```

## Migrating Existing Tests

To migrate an existing test page:

1. **Remove duplicate code**:
   - Delete score, totalQuestions, timer state
   - Delete timer useEffect
   - Delete user auth redirect logic
   - Delete result saving code

2. **Add useTestSession**:
   ```typescript
   const { state, actions } = useTestSession({
     testType: 'yourType',
     maxQuestions: yourMaxQuestions,
     difficulty: yourDifficulty,
   });
   ```

3. **Update state references**:
   - `score` → `state.score`
   - `totalQuestions` → `state.totalQuestions`
   - `elapsedTime` → `state.elapsedTime`
   - etc.

4. **Update actions**:
   - `setScore(score + 1)` → `actions.incrementScore()`
   - `setTotalQuestions(t + 1)` → `actions.incrementTotal()`
   - `setIsTimerRunning(true)` → `actions.startTimer()`
   - Manual result saving → `actions.completeTest()`

5. **Use common components** (optional but recommended):
   - Replace custom difficulty selector with `<DifficultySelector />`
   - Replace custom completion screen with `<TestCompleteScreen />`

## Test Types
Currently supported test types:
- `'fraction'` - Shaded area fractions test
- `'multiplication'` - Multiplication table practice
- `'addition'` - Addition practice
- `'orderOfOperations'` - Order of operations
- `'fractionAddition'` - Fraction addition
- `'leastCommonDenominator'` - LCD practice

Add new types in the `TestSessionConfig` interface in `useTestSession.ts`.



