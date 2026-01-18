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
  Input,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Exercise = {
  denominators: number[];
  lcd: number;
};

type CompletedExercise = Exercise & {
  userAnswer: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function LeastCommonDenominator() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
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
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  // GCD function
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  // LCM function
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  // LCM for multiple numbers
  const lcmMultiple = (numbers: number[]): number => {
    return numbers.reduce((acc, num) => lcm(acc, num), 1);
  };

  const generateExercise = (level: number, existingQuestions: Set<string> = new Set()): Exercise => {
    let denominators: number[];

    // Determine number of fractions based on difficulty
    const numFractions = level >= 4 ? 3 : 2;

    switch (level) {
      case 1: // Very easy: small numbers, easy LCD
        denominators = [];
        const base1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        denominators.push(base1);
        denominators.push(base1 * (Math.floor(Math.random() * 2) + 2)); // Multiple of first
        break;

      case 2: // Easy: small numbers
        denominators = [];
        for (let i = 0; i < numFractions; i++) {
          denominators.push(Math.floor(Math.random() * 5) + 2); // 2-6
        }
        break;

      case 3: // Medium: larger numbers
        denominators = [];
        for (let i = 0; i < numFractions; i++) {
          denominators.push(Math.floor(Math.random() * 7) + 3); // 3-9
        }
        break;

      case 4: // Hard: 3 numbers, larger range
        denominators = [];
        for (let i = 0; i < 3; i++) {
          denominators.push(Math.floor(Math.random() * 8) + 4); // 4-11
        }
        break;

      case 5: // Very hard: 3 numbers, largest range
        denominators = [];
        for (let i = 0; i < 3; i++) {
          denominators.push(Math.floor(Math.random() * 10) + 5); // 5-14
        }
        break;

      default:
        denominators = [2, 3];
    }

    const lcd = lcmMultiple(denominators);

    const result = {
      denominators,
      lcd,
    };

    // Check for duplicates (sorted to catch permutations)
    const questionKey = denominators.slice().sort((a, b) => a - b).join(',');

    if (existingQuestions.has(questionKey)) {
      let attempts = 0;
      while (attempts < 10) {
        const newExercise = generateExercise(level, existingQuestions);
        const newKey = newExercise.denominators.slice().sort((a, b) => a - b).join(',');
        if (!existingQuestions.has(newKey)) {
          return newExercise;
        }
        attempts++;
      }
    }

    return result;
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    const newUsedQuestions = new Set<string>();
    setUsedQuestions(newUsedQuestions);
    const firstExercise = generateExercise(level, newUsedQuestions);
    const firstKey = firstExercise.denominators.slice().sort((a, b) => a - b).join(',');
    newUsedQuestions.add(firstKey);
    setUsedQuestions(newUsedQuestions);
    setCurrentExercise(firstExercise);
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

  const handleHistoryClick = (exercise: CompletedExercise) => {
    setCurrentExercise({
      denominators: exercise.denominators,
      lcd: exercise.lcd,
    });
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    if (!currentExercise || userAnswer === "") return;

    const parsedAnswer = parseInt(userAnswer);
    const isAnswerCorrect = parsedAnswer === currentExercise.lcd;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    const completedExercise: CompletedExercise = {
      ...currentExercise,
      userAnswer: parsedAnswer,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now(),
    };
    setCompletedExercises([completedExercise, ...completedExercises]);

    if (isAnswerCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);

      toast({
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("leastCommonDenominator.inARow")}` : `✅ ${t("leastCommonDenominator.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("leastCommonDenominator.notQuite")}`,
        description: `${t("leastCommonDenominator.answerIs")} ${currentExercise.lcd}`,
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
        setUserAnswer("");
        const nextExercise = generateExercise(difficulty!, usedQuestions);
        setUsedQuestions(prev => {
          const newSet = new Set(prev);
          const key = nextExercise.denominators.slice().sort((a, b) => a - b).join(',');
          newSet.add(key);
          return newSet;
        });
        setCurrentExercise(nextExercise);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Exercise count and difficulty selection screen
  if (!maxExercises || !difficulty) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="teal.600" size="lg">
              {t("leastCommonDenominator.title")}
            </Heading>
            <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
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
                    colorScheme="teal"
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
                    colorScheme="teal"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "teal.50" }}
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
                ← {t("leastCommonDenominator.back")}
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
                ? t("leastCommonDenominator.perfectScore")
                : percentage >= 80
                  ? t("leastCommonDenominator.greatJob")
                  : percentage >= 60
                    ? t("leastCommonDenominator.wellDone")
                    : t("leastCommonDenominator.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="teal.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("leastCommonDenominator.testComplete")}
              </Heading>

              <HStack spacing={12} fontSize="xl" flexWrap="wrap" justify="center">
                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("leastCommonDenominator.yourScore")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="teal.600">
                    {score}/{totalQuestions}
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("leastCommonDenominator.accuracy")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="teal.600">
                    {percentage}%
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("leastCommonDenominator.time")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="teal.600">
                    {formatTime(elapsedTime)}
                  </Text>
                </VStack>
              </HStack>

              <Progress
                value={percentage}
                colorScheme="teal"
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
                setUserAnswer("");
                setTempCount(null);
              }}
              colorScheme="teal"
              size="lg"
              flex={1}
            >
              {t("leastCommonDenominator.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("leastCommonDenominator.backToTests")}
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
              🔥 {t("leastCommonDenominator.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="teal.600" size="lg">
            {t("leastCommonDenominator.title")}
          </Heading>
          <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("leastCommonDenominator.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("leastCommonDenominator.score")}: {score}/{totalQuestions} (
              {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="teal"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Exercise Card */}
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentExercise.denominators.join('-')}-${totalQuestions}`}
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
                : "teal.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={6}>
              {/* Question */}
              <Text fontSize="xl" fontWeight="bold" color="gray.700" textAlign="center">
                {t("leastCommonDenominator.question")}
              </Text>

              {/* Denominators Display */}
              <HStack spacing={4} fontSize="4xl" fontWeight="bold" flexWrap="wrap" justify="center">
                {currentExercise.denominators.map((denom, index) => (
                  <React.Fragment key={index}>
                    <VStack spacing={0}>
                      <Text color="teal.500">1</Text>
                      <Box width="40px" height="3px" bg="teal.500" />
                      <Text color="teal.500">{denom}</Text>
                    </VStack>
                    {index < currentExercise.denominators.length - 1 && (
                      <Text color="gray.400">,</Text>
                    )}
                  </React.Fragment>
                ))}
              </HStack>

              {/* Answer Input */}
              <HStack spacing={4} fontSize="2xl">
                <Text color="gray.600">{t("leastCommonDenominator.lcd")} =</Text>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="?"
                  size="lg"
                  fontSize="3xl"
                  fontWeight="bold"
                  textAlign="center"
                  width="200px"
                  minWidth="200px"
                  maxWidth="200px"
                  autoFocus
                  type="number"
                  borderWidth={3}
                  borderColor="teal.400"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 3px rgba(45, 212, 191, 0.3)",
                  }}
                  disabled={showFeedback}
                />
              </HStack>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="teal"
                size="lg"
                fontSize="xl"
                px={8}
                py={6}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("leastCommonDenominator.checkAnswer")}
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
              ? t("leastCommonDenominator.onFire")
              : streak >= 3
                ? t("leastCommonDenominator.amazing")
                : t("leastCommonDenominator.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("leastCommonDenominator.completedExercises")}
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
                    title={t("leastCommonDenominator.clickToRetry")}
                  >
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                      <HStack spacing={3} fontSize="lg" fontWeight="bold" flexWrap="wrap">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="gray.700">
                          LCD({exercise.denominators.join(", ")}) =
                        </Text>
                        <Text
                          color={exercise.isCorrect ? "green.600" : "red.600"}
                          textDecoration={exercise.isCorrect ? "none" : "line-through"}
                        >
                          {exercise.userAnswer}
                        </Text>
                        {!exercise.isCorrect && (
                          <Text color="green.600" fontSize="md">
                            (correct: {exercise.lcd})
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

