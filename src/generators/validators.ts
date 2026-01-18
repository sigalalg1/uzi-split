// Validator functions for different answer types

export function numberValidator(userAnswer: string | number, correctAnswer: string | number): boolean {
  const userNum = typeof userAnswer === "string" ? parseInt(userAnswer, 10) : userAnswer;
  const correctNum = typeof correctAnswer === "string" ? parseInt(correctAnswer, 10) : correctAnswer;
  
  if (isNaN(userNum) || isNaN(correctNum)) {
    return false;
  }
  
  return userNum === correctNum;
}

export function fractionValidator(userAnswer: string | number, correctAnswer: string | number): boolean {
  const userStr = typeof userAnswer === "number" ? userAnswer.toString() : userAnswer;
  const correctStr = typeof correctAnswer === "number" ? correctAnswer.toString() : correctAnswer;
  
  // Parse fraction strings (format: "numerator/denominator")
  const parseFraction = (str: string): { num: number; den: number } | null => {
    const parts = str.trim().split("/");
    if (parts.length !== 2) {
      // Check if it's a whole number
      const num = parseInt(str, 10);
      if (!isNaN(num)) {
        return { num, den: 1 };
      }
      return null;
    }
    
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    
    if (isNaN(num) || isNaN(den) || den === 0) {
      return null;
    }
    
    return { num, den };
  };
  
  const userFraction = parseFraction(userStr);
  const correctFraction = parseFraction(correctStr);
  
  if (!userFraction || !correctFraction) {
    return false;
  }
  
  // Helper function to find GCD
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  // Simplify fractions
  const simplify = (frac: { num: number; den: number }): { num: number; den: number } => {
    const divisor = gcd(Math.abs(frac.num), Math.abs(frac.den));
    return {
      num: frac.num / divisor,
      den: frac.den / divisor,
    };
  };
  
  const userSimplified = simplify(userFraction);
  const correctSimplified = simplify(correctFraction);
  
  // Compare simplified fractions
  return (
    userSimplified.num === correctSimplified.num &&
    userSimplified.den === correctSimplified.den
  );
}

// Export validators map for easy lookup
export const validators = {
  numberValidator,
  fractionValidator,
};

export type ValidatorMap = typeof validators;

