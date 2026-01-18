import subjectsData from "./subjects.json";
import testsData from "./tests.json";
import { SubjectsConfiguration, TestsConfiguration, SubjectDefinition, TestDefinition } from "./types";

const subjects = subjectsData as SubjectsConfiguration;
const tests = testsData as TestsConfiguration;

// Combined subject with its tests
export interface SubjectWithTests extends SubjectDefinition {
  tests: TestDefinition[];
}

// Get all subjects with their tests
export function getSubjectsWithTests(): SubjectWithTests[] {
  return subjects.subjects
    .map((subject) => ({
      ...subject,
      tests: tests.tests[subject.id] || [],
    }))
    .sort((a, b) => a.order - b.order);
}

// Get a single subject by ID
export function getSubject(subjectId: string): SubjectDefinition | undefined {
  return subjects.subjects.find((s) => s.id === subjectId);
}

// Get tests for a specific subject
export function getTestsForSubject(subjectId: string): TestDefinition[] {
  return tests.tests[subjectId] || [];
}

// Get a specific test
export function getTest(subjectId: string, testId: string): TestDefinition | undefined {
  const subjectTests = tests.tests[subjectId] || [];
  return subjectTests.find((t) => t.id === testId);
}

// Get all subjects (without tests)
export function getAllSubjects(): SubjectDefinition[] {
  return subjects.subjects.sort((a, b) => a.order - b.order);
}

