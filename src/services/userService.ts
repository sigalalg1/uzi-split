// User Service for localStorage operations

export interface User {
  username: string;
  createdAt: number;
  avatar?: string;
}

export interface TestResult {
  id: string;
  testType: string;
  score: number;
  totalQuestions: number;
  difficulty: number;
  timeElapsed: number;
  completedAt: number;
  percentage: number;
}

interface UserData {
  currentUser: string | null;
  users: Record<string, User>;
  testResults: Record<string, TestResult[]>;
}

const STORAGE_KEY = 'mathPlaceData';

// Get all data from localStorage
const getData = (): UserData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return {
    currentUser: null,
    users: {},
    testResults: {},
  };
};

// Save data to localStorage
const saveData = (data: UserData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Get current user
export const getCurrentUser = (): string | null => {
  const data = getData();
  return data.currentUser;
};

// Get all users
export const getAllUsers = (): User[] => {
  const data = getData();
  return Object.values(data.users);
};

// Get user by username
export const getUser = (username: string): User | null => {
  const data = getData();
  return data.users[username] || null;
};

// Create new user
export const createUser = (username: string, avatar?: string): User => {
  const data = getData();

  if (data.users[username]) {
    throw new Error('User already exists');
  }

  const user: User = {
    username,
    createdAt: Date.now(),
    avatar,
  };

  data.users[username] = user;
  data.testResults[username] = [];
  saveData(data);

  return user;
};

// Set current user (login)
export const setCurrentUser = (username: string): void => {
  const data = getData();

  if (!data.users[username]) {
    throw new Error('User does not exist');
  }

  data.currentUser = username;
  saveData(data);
};

// Logout (clear current user)
export const logout = (): void => {
  const data = getData();
  data.currentUser = null;
  saveData(data);
};

// Delete user
export const deleteUser = (username: string): void => {
  const data = getData();

  delete data.users[username];
  delete data.testResults[username];

  if (data.currentUser === username) {
    data.currentUser = null;
  }

  saveData(data);
};

// Save test result
export const saveTestResult = (username: string, result: Omit<TestResult, 'id'>): void => {
  const data = getData();

  if (!data.users[username]) {
    throw new Error('User does not exist');
  }

  const testResult: TestResult = {
    ...result,
    id: `${username}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  if (!data.testResults[username]) {
    data.testResults[username] = [];
  }

  data.testResults[username].unshift(testResult); // Add to beginning
  saveData(data);
};

// Get user test results
export const getUserTestResults = (username: string): TestResult[] => {
  const data = getData();
  return data.testResults[username] || [];
};

// Get user statistics
export const getUserStats = (username: string) => {
  const results = getUserTestResults(username);

  if (results.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      averagePercentage: 0,
      totalTime: 0,
      bestScore: null,
      recentTests: [],
    };
  }

  const totalTests = results.length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalTime = results.reduce((sum, r) => sum + r.timeElapsed, 0);
  const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalTests;

  const bestScore = results.reduce((best, current) => {
    if (!best || current.percentage > best.percentage) {
      return current;
    }
    return best;
  }, results[0]);

  return {
    totalTests,
    averageScore: totalScore / totalTests,
    averagePercentage: Math.round(averagePercentage),
    totalTime,
    bestScore,
    recentTests: results.slice(0, 10), // Last 10 tests
  };
};

// Clear user's test history
export const clearUserHistory = (username: string): void => {
  const data = getData();
  
  if (!data.users[username]) {
    throw new Error('User does not exist');
  }

  data.testResults[username] = [];
  saveData(data);
};

// Clear all data (for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

