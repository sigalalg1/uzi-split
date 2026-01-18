/**
 * Utility functions for test/practice pages
 */

/**
 * Format seconds into readable time string
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Format time for display (MM:SS format)
 */
export const formatTimeMinSec = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get performance message based on percentage
 */
export const getPerformanceMessage = (percentage: number): {
  title: string;
  emoji: string;
} => {
  if (percentage === 100) {
    return { title: 'perfectScore', emoji: '🎉' };
  }
  if (percentage >= 90) {
    return { title: 'excellent', emoji: '🌟' };
  }
  if (percentage >= 80) {
    return { title: 'greatJob', emoji: '⭐' };
  }
  if (percentage >= 70) {
    return { title: 'wellDone', emoji: '👏' };
  }
  if (percentage >= 60) {
    return { title: 'goodWork', emoji: '👍' };
  }
  return { title: 'keepPracticing', emoji: '💪' };
};

/**
 * Get color scheme based on percentage
 */
export const getScoreColorScheme = (percentage: number): string => {
  if (percentage >= 90) return 'green';
  if (percentage >= 80) return 'teal';
  if (percentage >= 70) return 'blue';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 50) return 'orange';
  return 'red';
};

/**
 * Get random element from array
 */
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Generate unique question key
 */
export const generateQuestionKey = (...parts: (string | number)[]): string => {
  return parts.join('-');
};

/**
 * Check if question already exists
 */
export const isQuestionUsed = (
  questionKey: string,
  usedQuestions: Set<string>
): boolean => {
  return usedQuestions.has(questionKey);
};

