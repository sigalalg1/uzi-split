import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import FractionInput from "../components/FractionInput";

const MotionBox = motion(Box);

type Fraction = {
  numerator: number;
  denominator: number;
};

type Exercise = {
  fraction1: Fraction;
  fraction2: Fraction;
  answerNumerator: number;
  answerDenominator: number;
};

type CompletedExercise = Exercise & {
  userNumerator: number;
  userDenominator: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function FractionAddition() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [decimalValue, setDecimalValue] = useState("");
  const [answerMode, setAnswerMode] = useState<"decimal" | "fraction">("fraction");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [maxExercises, setMaxExercises] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [tempCount, setTempCount] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // GCD function for simplifying fractions
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const generateExercise = (level: number): Exercise => {
    let fraction1: Fraction, fraction2: Fraction;

    switch (level) {
      case 1: // Same denominator, small numbers
        {
          const denom = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
          fraction1 = { numerator: Math.floor(Math.random() * (denom - 1)) + 1, denominator: denom };
          fraction2 = { numerator: Math.floor(Math.random() * (denom - 1)) + 1, denominator: denom };
        }
        break;
      case 2: // Same denominator, larger numbers
        {
          const denom = [6, 8, 10, 12][Math.floor(Math.random() * 4)];
          fraction1 = { numerator: Math.floor(Math.random() * (denom - 1)) + 1, denominator: denom };
          fraction2 = { numerator: Math.floor(Math.random() * (denom - 1)) + 1, denominator: denom };
        }
        break;
      case 3: // Different denominators, easy
        {
          const denoms = [[2, 4], [3, 6], [2, 6], [3, 9]];
          const pair = denoms[Math.floor(Math.random() * denoms.length)];
          fraction1 = { numerator: Math.floor(Math.random() * (pair[0] - 1)) + 1, denominator: pair[0] };
          fraction2 = { numerator: Math.floor(Math.random() * (pair[1] - 1)) + 1, denominator: pair[1] };
        }
        break;
      case 4: // Different denominators, medium
        {
          const denoms = [[3, 4], [4, 6], [5, 10], [2, 3]];
          const pair = denoms[Math.floor(Math.random() * denoms.length)];
          fraction1 = { numerator: Math.floor(Math.random() * (pair[0] - 1)) + 1, denominator: pair[0] };
          fraction2 = { numerator: Math.floor(Math.random() * (pair[1] - 1)) + 1, denominator: pair[1] };
        }
        break;
      case 5: // Different denominators, harder
        {
          const denoms = [[3, 5], [4, 7], [5, 8], [6, 9]];
          const pair = denoms[Math.floor(Math.random() * denoms.length)];
          fraction1 = { numerator: Math.floor(Math.random() * (pair[0] - 1)) + 1, denominator: pair[0] };
          fraction2 = { numerator: Math.floor(Math.random() * (pair[1] - 1)) + 1, denominator: pair[1] };
        }
        break;
      default:
        fraction1 = { numerator: 1, denominator: 2 };
        fraction2 = { numerator: 1, denominator: 2 };
    }

    // Calculate answer
    const commonDenom = (fraction1.denominator * fraction2.denominator) / gcd(fraction1.denominator, fraction2.denominator);
    const num1 = (fraction1.numerator * commonDenom) / fraction1.denominator;
    const num2 = (fraction2.numerator * commonDenom) / fraction2.denominator;
    const answerNum = num1 + num2;

    // Simplify answer
    const divisor = gcd(answerNum, commonDenom);

    return {
      fraction1,
      fraction2,
      answerNumerator: answerNum / divisor,
      answerDenominator: commonDenom / divisor,
    };
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    setCurrentExercise(generateExercise(level));
    setIsTimerRunning(true);
    setScore(0);
    setTotalQuestions(0);
    setCompletedExercises([]);
    setElapsedTime(0);
    setStreak(0);
    setIsGameComplete(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const checkAnswer = (): { isCorrect: boolean; userNumerator: number; userDenominator: number } => {
    if (!currentExercise) {
      return { isCorrect: false, userNumerator: 0, userDenominator: 1 };
    }

    let userNum: number, userDenom: number;

    if (answerMode === "decimal") {
      // Decimal mode
      if (decimalValue === "") {
        return { isCorrect: false, userNumerator: 0, userDenominator: 1 };
      }
      const decimal = parseFloat(decimalValue);
      const correctDecimal = currentExercise.answerNumerator / currentExercise.answerDenominator;

      // Check with tolerance for floating point
      const tolerance = 0.01;
      const isCorrect = Math.abs(decimal - correctDecimal) < tolerance;

      // Convert decimal to fraction for display
      userNum = Math.round(decimal * 100);
      userDenom = 100;
      const userGcd = gcd(Math.abs(userNum), Math.abs(userDenom));
      userNum = userNum / userGcd;
      userDenom = userDenom / userGcd;

      return { isCorrect, userNumerator: userNum, userDenominator: userDenom };
    } else {
      // Fraction mode
      if (numerator === "" || denominator === "" || denominator === "0") {
        return { isCorrect: false, userNumerator: 0, userDenominator: 1 };
      }

      userNum = parseInt(numerator);
      userDenom = parseInt(denominator);

      // Simplify user's answer
      const userGcd = gcd(Math.abs(userNum), Math.abs(userDenom));
      const simplifiedUserNum = userNum / userGcd;
      const simplifiedUserDenom = userDenom / userGcd;

      // Check if equal
      const isCorrect =
        simplifiedUserNum === currentExercise.answerNumerator &&
        simplifiedUserDenom === currentExercise.answerDenominator;

      return { isCorrect, userNumerator: userNum, userDenominator: userDenom };
    }
  };

  const handleSubmit = () => {
    if (!currentExercise) return;

    // Check if user has entered an answer
    if (answerMode === "decimal" && decimalValue === "") return;
    if (answerMode === "fraction" && (numerator === "" || denominator === "")) return;

    const { isCorrect: isAnswerCorrect, userNumerator, userDenominator } = checkAnswer();
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    const completedExercise: CompletedExercise = {
      ...currentExercise,
      userNumerator,
      userDenominator,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now(),
    };
    setCompletedExercises([completedExercise, ...completedExercises]);

    if (isAnswerCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);

      toast({
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("fractionAddition.inARow")}` : `✅ ${t("fractionAddition.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("fractionAddition.notQuite")}`,
        description: `${t("fractionAddition.answerIs")} ${currentExercise.answerNumerator}/${currentExercise.answerDenominator}`,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    if (maxExercises && totalQuestions + 1 >= maxExercises) {
      setIsTimerRunning(false);
      setIsGameComplete(true);
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setNumerator("");
        setDenominator("");
        setDecimalValue("");
        setCurrentExercise(generateExercise(difficulty!));
      }, 1500);
    }
  };

  const handleHistoryClick = (exercise: CompletedExercise) => {
    // Load the exercise from history
    setCurrentExercise({
      fraction1: exercise.fraction1,
      fraction2: exercise.fraction2,
      answerNumerator: exercise.answerNumerator,
      answerDenominator: exercise.answerDenominator,
    });

    // Clear inputs for retry
    setNumerator("");
    setDenominator("");
    setDecimalValue("");
    setShowFeedback(false);
    setIsCorrect(null);
  };

  // Exercise count and difficulty selection screen
  if (!maxExercises || !difficulty) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="pink.600" size="lg">
              {t("fractionAddition.title")}
            </Heading>
            <Badge colorScheme="pink" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.fractions")}
            </Badge>
          </HStack>

          {/* Question Count Selection */}
          {!tempCount && (
            <>
              <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectQuestions")}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                {[5, 10, 15, 20, 25].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setTempCount(count)}
                    colorScheme="pink"
                    size="lg"
                    fontSize="2xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    {count}
                  </Button>
                ))}
              </HStack>
            </>
          )}

          {/* Difficulty Level Selection */}
          {tempCount && (
            <>
              <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectDifficulty")}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    onClick={() => startGame(tempCount, level)}
                    colorScheme="pink"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "pink.50" }}
                    transition="all 0.2s"
                  >
                    {level}
                  </Button>
                ))}
              </HStack>

              <Button
                onClick={() => setTempCount(null)}
                colorScheme="gray"
                variant="ghost"
              >
                ← {t("fractionAddition.back")}
              </Button>
            </>
          )}
        </VStack>
      </Container>
    );
  }

  // Game complete screen
  if (isGameComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8}>
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Heading size="2xl" textAlign="center">
              {percentage === 100
                ? t("fractionAddition.perfectScore")
                : percentage >= 80
                  ? t("fractionAddition.greatJob")
                  : percentage >= 60
                    ? t("fractionAddition.wellDone")
                    : t("fractionAddition.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="pink.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("fractionAddition.testComplete")}
              </Heading>

              <HStack spacing={12} fontSize="xl" flexWrap="wrap" justify="center">
                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("fractionAddition.yourScore")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="pink.600">
                    {score}/{totalQuestions}
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("fractionAddition.accuracy")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="pink.600">
                    {percentage}%
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("fractionAddition.time")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="pink.600">
                    {formatTime(elapsedTime)}
                  </Text>
                </VStack>
              </HStack>

              <Progress
                value={percentage}
                colorScheme="pink"
                size="lg"
                borderRadius="full"
                width="100%"
              />
            </VStack>
          </Box>

          <HStack spacing={4} width="100%">
            <Button
              onClick={() => {
                setMaxExercises(null);
                setDifficulty(null);
                setNumerator("");
                setDenominator("");
                setDecimalValue("");
                setTempCount(null);
              }}
              colorScheme="pink"
              size="lg"
              flex={1}
            >
              {t("fractionAddition.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("fractionAddition.backToTests")}
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }

  if (!currentExercise) return null;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="flex-end" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 {t("fractionAddition.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="pink.600" size="lg">
            {t("fractionAddition.title")}
          </Heading>
          <Badge colorScheme="pink" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("fractionAddition.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("fractionAddition.score")}: {score}/{totalQuestions} (
              {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="pink"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Exercise Card */}
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentExercise.fraction1.numerator}-${currentExercise.fraction1.denominator}-${totalQuestions}`}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg={
              showFeedback
                ? isCorrect
                  ? "green.50"
                  : "red.50"
                : "white"
            }
            borderWidth={3}
            borderColor={
              showFeedback
                ? isCorrect
                  ? "green.400"
                  : "red.400"
                : "pink.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={6}>
              {/* Fraction Addition Problem */}
              <HStack spacing={6} fontSize="4xl" fontWeight="bold" flexWrap="wrap" justify="center" align="center">
                {/* Fraction 1 */}
                <VStack spacing={0}>
                  <Text color="pink.500">{currentExercise.fraction1.numerator}</Text>
                  <Box width="60px" height="3px" bg="pink.500" />
                  <Text color="pink.500">{currentExercise.fraction1.denominator}</Text>
                </VStack>

                <Text color="gray.600">+</Text>

                {/* Fraction 2 */}
                <VStack spacing={0}>
                  <Text color="pink.500">{currentExercise.fraction2.numerator}</Text>
                  <Box width="60px" height="3px" bg="pink.500" />
                  <Text color="pink.500">{currentExercise.fraction2.denominator}</Text>
                </VStack>

                <Text color="gray.600">=</Text>

                {/* Answer Input */}
                <FractionInput
                  numerator={numerator}
                  denominator={denominator}
                  onNumeratorChange={setNumerator}
                  onDenominatorChange={setDenominator}
                  decimalValue={decimalValue}
                  onDecimalChange={setDecimalValue}
                  mode={answerMode}
                  onModeChange={(mode) => {
                    setAnswerMode(mode);
                    setNumerator("");
                    setDenominator("");
                    setDecimalValue("");
                  }}
                  onSubmit={handleSubmit}
                  disabled={showFeedback}
                  autoFocus={true}
                  colorScheme="pink"
                />
              </HStack>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="pink"
                size="lg"
                fontSize="xl"
                px={8}
                py={6}
                isDisabled={
                  (answerMode === "decimal" && decimalValue === "") ||
                  (answerMode === "fraction" && (numerator === "" || denominator === "")) ||
                  showFeedback
                }
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("fractionAddition.checkAnswer")}
              </Button>
            </VStack>
          </Box>
        </MotionBox>

        {/* Encouragement Text */}
        <MotionBox
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Text textAlign="center" fontSize="xl" color="gray.500">
            {streak >= 5
              ? t("fractionAddition.onFire")
              : streak >= 3
                ? t("fractionAddition.amazing")
                : t("fractionAddition.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("fractionAddition.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
              {completedExercises.map((exercise) => (
                <MotionBox
                  key={exercise.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg={exercise.isCorrect ? "green.50" : "red.50"}
                    borderWidth={2}
                    borderColor={exercise.isCorrect ? "green.200" : "red.200"}
                    opacity={0.7}
                    _hover={{ opacity: 1, transform: "scale(1.02)", cursor: "pointer" }}
                    transition="all 0.2s"
                    onClick={() => handleHistoryClick(exercise)}
                    title={t("fractionAddition.clickToRetry")}
                  >
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                      <HStack spacing={3} fontSize="lg" fontWeight="bold" flexWrap="wrap">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="gray.700">
                          {exercise.fraction1.numerator}/{exercise.fraction1.denominator} + {exercise.fraction2.numerator}/{exercise.fraction2.denominator} =
                        </Text>
                        <Text
                          color={exercise.isCorrect ? "green.600" : "red.600"}
                          textDecoration={exercise.isCorrect ? "none" : "line-through"}
                        >
                          {exercise.userNumerator}/{exercise.userDenominator}
                        </Text>
                        {!exercise.isCorrect && (
                          <Text color="green.600" fontSize="md">
                            (correct: {exercise.answerNumerator}/{exercise.answerDenominator})
                          </Text>
                        )}
                      </HStack>
                      <Badge colorScheme={exercise.isCorrect ? "green" : "red"}>
                        {exercise.isCorrect ? "Correct" : "Wrong"}
                      </Badge>
                    </Flex>
                  </Box>
                </MotionBox>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

