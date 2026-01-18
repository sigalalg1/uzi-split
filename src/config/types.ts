// Configuration types for dynamic test system

export type GeneratorName =
  | "additionWithoutConversion"
  | "additionWithConversion"
  | "additionAdvanced"
  | "additionAdvanced3Digits"
  | "subtractionWithoutConversion"
  | "subtractionWithConversion"
  | "subtractionAdvanced2Digits"
  | "subtractionAdvanced3Digits"
  | "multiplicationTable"
  | "multiplicationAdvanced"
  | "orderOfOperations"
  | "fractionAddition"
  | "leastCommonDenominator"
  | "fractionMixed"
  | "numberLine";

export type ValidatorName = "numberValidator" | "fractionValidator";

export type InputType = "number" | "fraction";

export interface TestConfig {
  testType: string;
  operation: string;
  generator: GeneratorName;
  validator: ValidatorName;
  supportsHistory: boolean;
  difficultyLevels: {
    min: number;
    max: number;
  };
  inputType?: InputType;
}

export interface TestDefinition {
  id: string;
  i18nKey: string;
  url: string;
  componentType: string;
  config: TestConfig;
}

export interface SubjectDefinition {
  id: string;
  i18nKey: string;
  icon: string;
  color: string;
  description?: string;
  order: number;
}

export interface SubjectsConfiguration {
  subjects: SubjectDefinition[];
}

export interface TestsConfiguration {
  tests: Record<string, TestDefinition[]>;
}

// Exercise types
export interface BaseExercise {
  answer: number | string;
}

export interface NumberExercise extends BaseExercise {
  num1: number;
  num2: number;
  answer: number;
}

export interface FractionExercise extends BaseExercise {
  numerator1: number;
  denominator1: number;
  numerator2?: number;
  denominator2?: number;
  operation?: string;
  answerNumerator: number;
  answerDenominator: number;
  answer: string; // "numerator/denominator"
}

export interface OrderOfOperationsExercise extends BaseExercise {
  expression: string;
  answer: number;
}

export interface NumberLineExercise extends BaseExercise {
  targetNumber: number;
  min: number;
  max: number;
  answer: number;
}

export type Exercise =
  | NumberExercise
  | FractionExercise
  | OrderOfOperationsExercise
  | NumberLineExercise;

export type CompletedExercise = Exercise & {
  userAnswer: number | string;
  isCorrect: boolean;
  timestamp: number;
}

// Generator function type
export type GeneratorFunction = (
  level: number,
  existingQuestions?: Set<string>
) => Exercise;

// Validator function type
export type ValidatorFunction = (
  userAnswer: string | number,
  correctAnswer: string | number
) => boolean;

