import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import * as userService from '../services/userService';

export interface TestSessionConfig {
  testType: 'fraction' | 'multiplication' | 'addition' | 'orderOfOperations' | 'fractionAddition' | 'leastCommonDenominator';
  maxQuestions: number;
  difficulty: number;
  requireAuth?: boolean;
}

export interface TestSessionState {
  score: number;
  totalQuestions: number;
  elapsedTime: number;
  isTimerRunning: boolean;
  isGameComplete: boolean;
}

export interface TestSessionActions {
  incrementScore: () => void;
  incrementTotal: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  completeTest: () => void;
  resetSession: () => void;
}

export function useTestSession(config: TestSessionConfig) {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useUser();

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Redirect to login if auth is required and user is not authenticated
  useEffect(() => {
    if (config.requireAuth !== false && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, config.requireAuth]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const incrementScore = useCallback(() => {
    setScore((prev) => prev + 1);
  }, []);

  const incrementTotal = useCallback(() => {
    setTotalQuestions((prev) => prev + 1);
  }, []);

  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const completeTest = useCallback(() => {
    setIsTimerRunning(false);
    setIsGameComplete(true);

    // Auto-save test result if user is authenticated
    if (currentUser) {
      const percentage = Math.round((score / totalQuestions) * 100);
      const testResult = {
        testType: config.testType,
        score,
        totalQuestions,
        difficulty: config.difficulty,
        timeElapsed: elapsedTime,
        completedAt: Date.now(),
        percentage,
      };

      try {
        userService.saveTestResult(currentUser, testResult);
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }
  }, [currentUser, score, totalQuestions, config.testType, config.difficulty, elapsedTime]);

  const resetSession = useCallback(() => {
    setScore(0);
    setTotalQuestions(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsGameComplete(false);
  }, []);

  return {
    state: {
      score,
      totalQuestions,
      elapsedTime,
      isTimerRunning,
      isGameComplete,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    },
    actions: {
      incrementScore,
      incrementTotal,
      startTimer,
      stopTimer,
      completeTest,
      resetSession,
    },
    currentUser,
    isAuthenticated,
  };
}

