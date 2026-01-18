import {
  NumberExercise,
  FractionExercise,
  OrderOfOperationsExercise,
  NumberLineExercise,
  CompareNumbersExercise,
  SequenceExercise,
  PlaceValueExercise,
} from "../config/types";

// Helper function to check for duplicate questions
const isDuplicate = (
  questionKey: string,
  existingQuestions: Set<string>,
  reverseKey?: string
): boolean => {
  if (existingQuestions.has(questionKey)) return true;
  if (reverseKey && existingQuestions.has(reverseKey)) return true;
  return false;
};

// Addition Generators

export function additionWithoutConversion(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number, maxNum: number;

  switch (level) {
    case 1: // Very easy: 1-4, sum < 6
      num1 = Math.floor(Math.random() * 4) + 1;
      maxNum = Math.min(5 - num1, 4);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      break;
    case 2: // Easy: 1-5, sum < 8
      num1 = Math.floor(Math.random() * 5) + 1;
      maxNum = Math.min(7 - num1, 5);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      break;
    case 3: // Medium: 1-6, sum < 10
      num1 = Math.floor(Math.random() * 6) + 1;
      maxNum = Math.min(9 - num1, 6);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      break;
    case 4: // Hard: 1-8, sum < 12
      num1 = Math.floor(Math.random() * 8) + 1;
      maxNum = Math.min(11 - num1, 8);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      break;
    case 5: // Very hard: 1-10, sum < 15
      num1 = Math.floor(Math.random() * 10) + 1;
      maxNum = Math.min(14 - num1, 10);
      num2 = Math.floor(Math.random() * maxNum) + 1;
      break;
    default:
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * (9 - num1)) + 1;
  }

  const questionKey = `${num1}+${num2}`;
  const questionKeyReverse = `${num2}+${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = additionWithoutConversion(level, existingQuestions);
      const newKey = `${newExercise.num1}+${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}+${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 + num2 };
}

export function additionWithConversion(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // Easy: single digit + single digit with carry (e.g., 7+5, 8+6)
      num1 = Math.floor(Math.random() * 4) + 6; // 6-9
      num2 = Math.floor(Math.random() * (19 - num1 - 5)) + (11 - num1);
      break;
    case 2: // Medium: teens + single digit with carry
      num1 = Math.floor(Math.random() * 7) + 13; // 13-19
      num2 = Math.floor(Math.random() * 5) + 6; // 6-10
      break;
    case 3: // Medium-hard: two digits + single digit with carry
      num1 = Math.floor(Math.random() * 30) + 25; // 25-54
      num2 = Math.floor(Math.random() * 8) + 7; // 7-14
      break;
    case 4: // Hard: two digits + two digits with carry
      num1 = Math.floor(Math.random() * 40) + 25; // 25-64
      num2 = Math.floor(Math.random() * 40) + 25; // 25-64
      break;
    case 5: // Very hard: larger two digits with multiple carries
      num1 = Math.floor(Math.random() * 50) + 45; // 45-94
      num2 = Math.floor(Math.random() * 50) + 45; // 45-94
      break;
    default:
      num1 = Math.floor(Math.random() * 4) + 6;
      num2 = Math.floor(Math.random() * 4) + 6;
  }

  const questionKey = `${num1}+${num2}`;
  const questionKeyReverse = `${num2}+${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = additionWithConversion(level, existingQuestions);
      const newKey = `${newExercise.num1}+${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}+${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 + num2 };
}

export function additionAdvanced(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // 10-29 + 10-29
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 20) + 10;
      break;
    case 2: // 20-49 + 20-49
      num1 = Math.floor(Math.random() * 30) + 20;
      num2 = Math.floor(Math.random() * 30) + 20;
      break;
    case 3: // 30-69 + 30-69
      num1 = Math.floor(Math.random() * 40) + 30;
      num2 = Math.floor(Math.random() * 40) + 30;
      break;
    case 4: // 40-89 + 40-89
      num1 = Math.floor(Math.random() * 50) + 40;
      num2 = Math.floor(Math.random() * 50) + 40;
      break;
    case 5: // 50-99 + 50-99
      num1 = Math.floor(Math.random() * 50) + 50;
      num2 = Math.floor(Math.random() * 50) + 50;
      break;
    default:
      num1 = Math.floor(Math.random() * 30) + 20;
      num2 = Math.floor(Math.random() * 30) + 20;
  }

  const questionKey = `${num1}+${num2}`;
  const questionKeyReverse = `${num2}+${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = additionAdvanced(level, existingQuestions);
      const newKey = `${newExercise.num1}+${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}+${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 + num2 };
}

export function additionAdvanced3Digits(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // 100-299 + 100-299
      num1 = Math.floor(Math.random() * 200) + 100;
      num2 = Math.floor(Math.random() * 200) + 100;
      break;
    case 2: // 150-399 + 150-399
      num1 = Math.floor(Math.random() * 250) + 150;
      num2 = Math.floor(Math.random() * 250) + 150;
      break;
    case 3: // 200-499 + 200-499
      num1 = Math.floor(Math.random() * 300) + 200;
      num2 = Math.floor(Math.random() * 300) + 200;
      break;
    case 4: // 300-699 + 300-699
      num1 = Math.floor(Math.random() * 400) + 300;
      num2 = Math.floor(Math.random() * 400) + 300;
      break;
    case 5: // 400-999 + 400-999
      num1 = Math.floor(Math.random() * 600) + 400;
      num2 = Math.floor(Math.random() * 600) + 400;
      break;
    default:
      num1 = Math.floor(Math.random() * 200) + 100;
      num2 = Math.floor(Math.random() * 200) + 100;
  }

  const questionKey = `${num1}+${num2}`;
  const questionKeyReverse = `${num2}+${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = additionAdvanced3Digits(level, existingQuestions);
      const newKey = `${newExercise.num1}+${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}+${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 + num2 };
}

// Subtraction Generators

export function subtractionWithoutConversion(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // Very easy: 2-9 minus 1-4
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * Math.min(num1, 4)) + 1;
      break;
    case 2: // Easy: 5-10 minus 1-5
      num1 = Math.floor(Math.random() * 6) + 5;
      num2 = Math.floor(Math.random() * Math.min(num1, 5)) + 1;
      break;
    case 3: // Medium: 6-12 minus 1-7
      num1 = Math.floor(Math.random() * 7) + 6;
      num2 = Math.floor(Math.random() * Math.min(num1, 7)) + 1;
      break;
    case 4: // Hard: 8-15 minus 1-9
      num1 = Math.floor(Math.random() * 8) + 8;
      num2 = Math.floor(Math.random() * Math.min(num1, 9)) + 1;
      break;
    case 5: // Very hard: 10-18 minus 1-10
      num1 = Math.floor(Math.random() * 9) + 10;
      num2 = Math.floor(Math.random() * Math.min(num1, 10)) + 1;
      break;
    default:
      num1 = Math.floor(Math.random() * 6) + 5;
      num2 = Math.floor(Math.random() * Math.min(num1, 5)) + 1;
  }

  const questionKey = `${num1}-${num2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = subtractionWithoutConversion(level, existingQuestions);
      const newKey = `${newExercise.num1}-${newExercise.num2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 - num2 };
}

export function subtractionWithConversion(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // Easy: 11-19 minus 6-9 (requires borrowing)
      num1 = Math.floor(Math.random() * 9) + 11;
      num2 = Math.floor(Math.random() * 4) + 6;
      break;
    case 2: // Medium: 20-49 minus 11-19
      num1 = Math.floor(Math.random() * 30) + 20;
      num2 = Math.floor(Math.random() * 9) + 11;
      break;
    case 3: // Medium-hard: 30-69 minus 15-29
      num1 = Math.floor(Math.random() * 40) + 30;
      num2 = Math.floor(Math.random() * 15) + 15;
      break;
    case 4: // Hard: 50-99 minus 20-49
      num1 = Math.floor(Math.random() * 50) + 50;
      num2 = Math.floor(Math.random() * 30) + 20;
      break;
    case 5: // Very hard: 100-199 minus 50-99
      num1 = Math.floor(Math.random() * 100) + 100;
      num2 = Math.floor(Math.random() * 50) + 50;
      break;
    default:
      num1 = Math.floor(Math.random() * 9) + 11;
      num2 = Math.floor(Math.random() * 4) + 6;
  }

  const questionKey = `${num1}-${num2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = subtractionWithConversion(level, existingQuestions);
      const newKey = `${newExercise.num1}-${newExercise.num2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 - num2 };
}

export function subtractionAdvanced2Digits(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // 20-49 minus 10-29
      num1 = Math.floor(Math.random() * 30) + 20;
      num2 = Math.floor(Math.random() * 20) + 10;
      if (num2 > num1) num2 = num1 - 5;
      break;
    case 2: // 30-69 minus 15-39
      num1 = Math.floor(Math.random() * 40) + 30;
      num2 = Math.floor(Math.random() * 25) + 15;
      if (num2 > num1) num2 = num1 - 10;
      break;
    case 3: // 40-79 minus 20-49
      num1 = Math.floor(Math.random() * 40) + 40;
      num2 = Math.floor(Math.random() * 30) + 20;
      if (num2 > num1) num2 = num1 - 10;
      break;
    case 4: // 50-89 minus 25-59
      num1 = Math.floor(Math.random() * 40) + 50;
      num2 = Math.floor(Math.random() * 35) + 25;
      if (num2 > num1) num2 = num1 - 15;
      break;
    case 5: // 60-99 minus 30-69
      num1 = Math.floor(Math.random() * 40) + 60;
      num2 = Math.floor(Math.random() * 40) + 30;
      if (num2 > num1) num2 = num1 - 20;
      break;
    default:
      num1 = Math.floor(Math.random() * 30) + 20;
      num2 = Math.floor(Math.random() * 20) + 10;
      if (num2 > num1) num2 = num1 - 5;
  }

  const questionKey = `${num1}-${num2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = subtractionAdvanced2Digits(level, existingQuestions);
      const newKey = `${newExercise.num1}-${newExercise.num2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 - num2 };
}

export function subtractionAdvanced3Digits(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // 100-299 minus 50-149
      num1 = Math.floor(Math.random() * 200) + 100;
      num2 = Math.floor(Math.random() * 100) + 50;
      if (num2 > num1) num2 = num1 - 25;
      break;
    case 2: // 200-499 minus 100-249
      num1 = Math.floor(Math.random() * 300) + 200;
      num2 = Math.floor(Math.random() * 150) + 100;
      if (num2 > num1) num2 = num1 - 50;
      break;
    case 3: // 300-699 minus 150-399
      num1 = Math.floor(Math.random() * 400) + 300;
      num2 = Math.floor(Math.random() * 250) + 150;
      if (num2 > num1) num2 = num1 - 75;
      break;
    case 4: // 500-899 minus 200-549
      num1 = Math.floor(Math.random() * 400) + 500;
      num2 = Math.floor(Math.random() * 350) + 200;
      if (num2 > num1) num2 = num1 - 100;
      break;
    case 5: // 600-999 minus 300-699
      num1 = Math.floor(Math.random() * 400) + 600;
      num2 = Math.floor(Math.random() * 400) + 300;
      if (num2 > num1) num2 = num1 - 150;
      break;
    default:
      num1 = Math.floor(Math.random() * 200) + 100;
      num2 = Math.floor(Math.random() * 100) + 50;
      if (num2 > num1) num2 = num1 - 25;
  }

  const questionKey = `${num1}-${num2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = subtractionAdvanced3Digits(level, existingQuestions);
      const newKey = `${newExercise.num1}-${newExercise.num2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 - num2 };
}

// Multiplication Generators

export function multiplicationTable(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // Very easy: 1-5 tables
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case 2: // Easy: 1-10 tables
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case 3: // Medium: 6-12 tables
      num1 = Math.floor(Math.random() * 7) + 6;
      num2 = Math.floor(Math.random() * 7) + 6;
      break;
    case 4: // Hard: 8-15 tables
      num1 = Math.floor(Math.random() * 8) + 8;
      num2 = Math.floor(Math.random() * 8) + 8;
      break;
    case 5: // Very hard: 11-20 tables
      num1 = Math.floor(Math.random() * 10) + 11;
      num2 = Math.floor(Math.random() * 10) + 11;
      break;
    default:
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
  }

  const questionKey = `${num1}×${num2}`;
  const questionKeyReverse = `${num2}×${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = multiplicationTable(level, existingQuestions);
      const newKey = `${newExercise.num1}×${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}×${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 * num2 };
}

export function multiplicationAdvanced(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // 11-19 × 2-5
      num1 = Math.floor(Math.random() * 9) + 11;
      num2 = Math.floor(Math.random() * 4) + 2;
      break;
    case 2: // 11-29 × 6-9
      num1 = Math.floor(Math.random() * 19) + 11;
      num2 = Math.floor(Math.random() * 4) + 6;
      break;
    case 3: // 11-49 × 11-19
      num1 = Math.floor(Math.random() * 39) + 11;
      num2 = Math.floor(Math.random() * 9) + 11;
      break;
    case 4: // 21-69 × 11-29
      num1 = Math.floor(Math.random() * 49) + 21;
      num2 = Math.floor(Math.random() * 19) + 11;
      break;
    case 5: // 31-99 × 11-49
      num1 = Math.floor(Math.random() * 69) + 31;
      num2 = Math.floor(Math.random() * 39) + 11;
      break;
    default:
      num1 = Math.floor(Math.random() * 9) + 11;
      num2 = Math.floor(Math.random() * 4) + 2;
  }

  const questionKey = `${num1}×${num2}`;
  const questionKeyReverse = `${num2}×${num1}`;

  if (isDuplicate(questionKey, existingQuestions, questionKeyReverse)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = multiplicationAdvanced(level, existingQuestions);
      const newKey = `${newExercise.num1}×${newExercise.num2}`;
      const newKeyReverse = `${newExercise.num2}×${newExercise.num1}`;
      if (!isDuplicate(newKey, existingQuestions, newKeyReverse)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: num1 * num2 };
}

// Order of Operations Generator

export function orderOfOperations(
  level: number,
  existingQuestions: Set<string> = new Set()
): OrderOfOperationsExercise {
  let expression: string;
  let answer: number;

  const generateSimpleExpression = (): { expr: string; ans: number } => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const c = Math.floor(Math.random() * 10) + 1;

    const ops = ["+", "-", "×"];
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];

    let expr = `${a} ${op1} ${b} ${op2} ${c}`;
    let result: number;

    // Calculate based on order of operations
    if (op1 === "×") {
      const temp = a * b;
      result = op2 === "+" ? temp + c : op2 === "-" ? temp - c : temp * c;
    } else if (op2 === "×") {
      const temp = b * c;
      result = op1 === "+" ? a + temp : a - temp;
    } else {
      result = op1 === "+" ? a + b : a - b;
      result = op2 === "+" ? result + c : result - c;
    }

    return { expr, ans: result };
  };

  switch (level) {
    case 1: // Simple: 2 operations, no parentheses
      const simple = generateSimpleExpression();
      expression = simple.expr;
      answer = simple.ans;
      break;
    case 2: // Medium: 2-3 operations with one multiplication
      const a2 = Math.floor(Math.random() * 10) + 1;
      const b2 = Math.floor(Math.random() * 5) + 1;
      const c2 = Math.floor(Math.random() * 10) + 1;
      expression = `${a2} + ${b2} × ${c2}`;
      answer = a2 + b2 * c2;
      break;
    case 3: // Medium-hard: 3 operations with parentheses
      const a3 = Math.floor(Math.random() * 10) + 1;
      const b3 = Math.floor(Math.random() * 10) + 1;
      const c3 = Math.floor(Math.random() * 5) + 1;
      expression = `(${a3} + ${b3}) × ${c3}`;
      answer = (a3 + b3) * c3;
      break;
    case 4: // Hard: 4 operations with parentheses and multiplication
      const a4 = Math.floor(Math.random() * 10) + 1;
      const b4 = Math.floor(Math.random() * 5) + 1;
      const c4 = Math.floor(Math.random() * 10) + 1;
      const d4 = Math.floor(Math.random() * 5) + 1;
      expression = `${a4} + ${b4} × (${c4} + ${d4})`;
      answer = a4 + b4 * (c4 + d4);
      break;
    case 5: // Very hard: Complex with multiple parentheses
      const a5 = Math.floor(Math.random() * 10) + 1;
      const b5 = Math.floor(Math.random() * 5) + 1;
      const c5 = Math.floor(Math.random() * 10) + 1;
      const d5 = Math.floor(Math.random() * 5) + 1;
      expression = `(${a5} + ${b5}) × (${c5} + ${d5})`;
      answer = (a5 + b5) * (c5 + d5);
      break;
    default:
      const def = generateSimpleExpression();
      expression = def.expr;
      answer = def.ans;
  }

  const questionKey = expression;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = orderOfOperations(level, existingQuestions);
      if (!isDuplicate(newExercise.expression, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { expression, answer };
}

// Fraction Generators

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const simplifyFraction = (num: number, den: number): { num: number; den: number } => {
  const divisor = gcd(num, den);
  return { num: num / divisor, den: den / divisor };
};

export function fractionAddition(
  level: number,
  existingQuestions: Set<string> = new Set()
): FractionExercise {
  let numerator1: number, denominator1: number, numerator2: number, denominator2: number;

  switch (level) {
    case 1: // Same denominator, small numbers
      denominator1 = Math.floor(Math.random() * 5) + 2; // 2-6
      denominator2 = denominator1;
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - numerator1)) + 1;
      break;
    case 2: // Same denominator, larger numbers
      denominator1 = Math.floor(Math.random() * 8) + 4; // 4-11
      denominator2 = denominator1;
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
      break;
    case 3: // Different denominators, one is multiple of other
      denominator1 = Math.floor(Math.random() * 4) + 2; // 2-5
      denominator2 = denominator1 * (Math.floor(Math.random() * 2) + 2); // 2x or 3x
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
      break;
    case 4: // Different denominators, need LCD
      denominator1 = Math.floor(Math.random() * 6) + 3; // 3-8
      denominator2 = Math.floor(Math.random() * 6) + 3; // 3-8
      while (denominator2 === denominator1) {
        denominator2 = Math.floor(Math.random() * 6) + 3;
      }
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
      break;
    case 5: // Complex fractions with larger denominators
      denominator1 = Math.floor(Math.random() * 10) + 5; // 5-14
      denominator2 = Math.floor(Math.random() * 10) + 5; // 5-14
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
      break;
    default:
      denominator1 = Math.floor(Math.random() * 5) + 2;
      denominator2 = denominator1;
      numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
      numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
  }

  // Calculate answer
  const commonDen = (denominator1 * denominator2) / gcd(denominator1, denominator2);
  const answerNum = (numerator1 * commonDen) / denominator1 + (numerator2 * commonDen) / denominator2;
  const simplified = simplifyFraction(answerNum, commonDen);

  const questionKey = `${numerator1}/${denominator1}+${numerator2}/${denominator2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = fractionAddition(level, existingQuestions);
      const newKey = `${newExercise.numerator1}/${newExercise.denominator1}+${newExercise.numerator2}/${newExercise.denominator2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return {
    numerator1,
    denominator1,
    numerator2,
    denominator2,
    operation: "+",
    answerNumerator: simplified.num,
    answerDenominator: simplified.den,
    answer: `${simplified.num}/${simplified.den}`,
  };
}

export function leastCommonDenominator(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberExercise {
  let num1: number, num2: number;

  switch (level) {
    case 1: // Small numbers
      num1 = Math.floor(Math.random() * 5) + 2; // 2-6
      num2 = Math.floor(Math.random() * 5) + 2; // 2-6
      break;
    case 2: // Medium numbers
      num1 = Math.floor(Math.random() * 8) + 3; // 3-10
      num2 = Math.floor(Math.random() * 8) + 3; // 3-10
      break;
    case 3: // Larger numbers
      num1 = Math.floor(Math.random() * 10) + 5; // 5-14
      num2 = Math.floor(Math.random() * 10) + 5; // 5-14
      break;
    case 4: // Even larger
      num1 = Math.floor(Math.random() * 15) + 6; // 6-20
      num2 = Math.floor(Math.random() * 15) + 6; // 6-20
      break;
    case 5: // Complex
      num1 = Math.floor(Math.random() * 20) + 10; // 10-29
      num2 = Math.floor(Math.random() * 20) + 10; // 10-29
      break;
    default:
      num1 = Math.floor(Math.random() * 5) + 2;
      num2 = Math.floor(Math.random() * 5) + 2;
  }

  const lcd = (num1 * num2) / gcd(num1, num2);
  const questionKey = `lcd:${num1},${num2}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = leastCommonDenominator(level, existingQuestions);
      const newKey = `lcd:${newExercise.num1},${newExercise.num2}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, answer: lcd };
}

export function fractionMixed(
  level: number,
  existingQuestions: Set<string> = new Set()
): FractionExercise {
  // Similar to fractionAddition but with mixed operations
  return fractionAddition(level, existingQuestions);
}

// Number Line Generator

export function numberLine(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberLineExercise {
  let min: number, max: number, targetNumber: number;

  switch (level) {
    case 1: // 0-10
      min = 0;
      max = 10;
      targetNumber = Math.floor(Math.random() * 11);
      break;
    case 2: // 0-20
      min = 0;
      max = 20;
      targetNumber = Math.floor(Math.random() * 21);
      break;
    case 3: // 0-50
      min = 0;
      max = 50;
      targetNumber = Math.floor(Math.random() * 51);
      break;
    case 4: // 0-100
      min = 0;
      max = 100;
      targetNumber = Math.floor(Math.random() * 101);
      break;
    case 5: // Negative numbers: -50 to 50
      min = -50;
      max = 50;
      targetNumber = Math.floor(Math.random() * 101) - 50;
      break;
    default:
      min = 0;
      max = 10;
      targetNumber = Math.floor(Math.random() * 11);
  }

  const questionKey = `numberline:${min}-${max}:${targetNumber}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = numberLine(level, existingQuestions);
      const newKey = `numberline:${newExercise.min}-${newExercise.max}:${newExercise.targetNumber}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { targetNumber, min, max, answer: targetNumber };
}

// Natural Numbers Generators

// Compare Numbers Generator
export function compareNumbers(
  level: number,
  existingQuestions: Set<string> = new Set()
): CompareNumbersExercise {
  let num1: number, num2: number;
  const comparisons: Array<"greater" | "lesser" | "equal"> = ["greater", "lesser"];
  
  switch (level) {
    case 1: // 1-20
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 20) + 1;
      break;
    case 2: // 1-50
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 50) + 1;
      break;
    case 3: // 1-100
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 100) + 1;
      break;
    case 4: // 1-500
      num1 = Math.floor(Math.random() * 500) + 1;
      num2 = Math.floor(Math.random() * 500) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 500) + 1;
      break;
    case 5: // 1-1000
      num1 = Math.floor(Math.random() * 1000) + 1;
      num2 = Math.floor(Math.random() * 1000) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 1000) + 1;
      break;
    default:
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      while (num2 === num1) num2 = Math.floor(Math.random() * 20) + 1;
  }

  const comparison = comparisons[Math.floor(Math.random() * comparisons.length)];
  const answer = comparison === "greater" ? Math.max(num1, num2) : Math.min(num1, num2);

  const questionKey = `compare:${num1},${num2},${comparison}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = compareNumbers(level, existingQuestions);
      const newKey = `compare:${newExercise.num1},${newExercise.num2},${newExercise.comparison}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { num1, num2, comparison, answer };
}

// Complete Number Sequence Generator
export function completeSequence(
  level: number,
  existingQuestions: Set<string> = new Set()
): SequenceExercise {
  let step: number, start: number, length: number;

  switch (level) {
    case 1: // Simple sequences (step 1-2), length 5
      step = Math.floor(Math.random() * 2) + 1; // 1-2
      start = Math.floor(Math.random() * 10) + 1;
      length = 5;
      break;
    case 2: // Step 2-5, length 5
      step = Math.floor(Math.random() * 4) + 2; // 2-5
      start = Math.floor(Math.random() * 20) + 1;
      length = 5;
      break;
    case 3: // Step 5-10, length 6
      step = Math.floor(Math.random() * 6) + 5; // 5-10
      start = Math.floor(Math.random() * 50) + 1;
      length = 6;
      break;
    case 4: // Step 10-20, length 6
      step = Math.floor(Math.random() * 11) + 10; // 10-20
      start = Math.floor(Math.random() * 100) + 1;
      length = 6;
      break;
    case 5: // Step 20-50, length 7
      step = Math.floor(Math.random() * 31) + 20; // 20-50
      start = Math.floor(Math.random() * 100) + 1;
      length = 7;
      break;
    default:
      step = 1;
      start = Math.floor(Math.random() * 10) + 1;
      length = 5;
  }

  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(start + i * step);
  }

  // Pick a random index to be missing (not first or last for clarity)
  const missingIndex = Math.floor(Math.random() * (length - 2)) + 1;
  const answer = sequence[missingIndex];

  const questionKey = `sequence:${sequence.join(",")},${missingIndex}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = completeSequence(level, existingQuestions);
      const newKey = `sequence:${newExercise.sequence.join(",")},${newExercise.missingIndex}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { sequence, missingIndex, answer };
}

// Find Missing Number (alias for completeSequence)
export function findMissingNumber(
  level: number,
  existingQuestions: Set<string> = new Set()
): SequenceExercise {
  return completeSequence(level, existingQuestions);
}

// Place Value Generator
export function placeValue(
  level: number,
  existingQuestions: Set<string> = new Set()
): PlaceValueExercise {
  let number: number;
  let place: "hundreds" | "tens" | "units";
  
  switch (level) {
    case 1: // Two-digit numbers, tens or units
      number = Math.floor(Math.random() * 90) + 10; // 10-99
      place = Math.random() < 0.5 ? "tens" : "units";
      break;
    case 2: // Three-digit numbers, any place
      number = Math.floor(Math.random() * 900) + 100; // 100-999
      const places2: Array<"hundreds" | "tens" | "units"> = ["hundreds", "tens", "units"];
      place = places2[Math.floor(Math.random() * places2.length)];
      break;
    case 3: // Three-digit numbers with more variety
      number = Math.floor(Math.random() * 900) + 100; // 100-999
      const places3: Array<"hundreds" | "tens" | "units"> = ["hundreds", "tens", "units"];
      place = places3[Math.floor(Math.random() * places3.length)];
      break;
    case 4: // Larger three-digit numbers
      number = Math.floor(Math.random() * 900) + 100; // 100-999
      const places4: Array<"hundreds" | "tens" | "units"> = ["hundreds", "tens", "units"];
      place = places4[Math.floor(Math.random() * places4.length)];
      break;
    case 5: // Even larger numbers
      number = Math.floor(Math.random() * 900) + 100; // 100-999
      const places5: Array<"hundreds" | "tens" | "units"> = ["hundreds", "tens", "units"];
      place = places5[Math.floor(Math.random() * places5.length)];
      break;
    default:
      number = Math.floor(Math.random() * 90) + 10;
      place = Math.random() < 0.5 ? "tens" : "units";
  }

  let answer: number;
  if (place === "hundreds") {
    answer = Math.floor(number / 100);
  } else if (place === "tens") {
    answer = Math.floor((number % 100) / 10);
  } else {
    answer = number % 10;
  }

  const questionKey = `placevalue:${number},${place}`;

  if (isDuplicate(questionKey, existingQuestions)) {
    let attempts = 0;
    while (attempts < 10) {
      const newExercise = placeValue(level, existingQuestions);
      const newKey = `placevalue:${newExercise.number},${newExercise.place}`;
      if (!isDuplicate(newKey, existingQuestions)) {
        return newExercise;
      }
      attempts++;
    }
  }

  return { number, place, answer };
}

// Locate Number on Number Line (similar to numberLine but with different presentation)
export function locateNumberLine(
  level: number,
  existingQuestions: Set<string> = new Set()
): NumberLineExercise {
  return numberLine(level, existingQuestions);
}

