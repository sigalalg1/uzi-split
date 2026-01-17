import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Progress,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Exercise = {
  expression: string;
  answer: number;
};

type CompletedExercise = Exercise & {
  userAnswer: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function OrderOfOperations() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

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

  const generateExercise = (level: number): Exercise => {
    const operators = ['+', '-', '*', '/'];
    const complexity = Math.random();

    // Adjust number ranges based on difficulty level
    const maxNum = level === 1 ? 5 : level === 2 ? 8 : level === 3 ? 10 : level === 4 ? 12 : 15;

    if (complexity < 0.3) {
      // Simple: a op b op c (3 numbers, 2 operators)
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      const c = Math.floor(Math.random() * maxNum) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];

      const expression = `${a} ${op1} ${b} ${op2} ${c}`;
      const answer = eval(expression);

      return { expression, answer: Math.round(answer * 100) / 100 };
    } else if (complexity < 0.7) {
      // Medium: (a op b) op c op d (4 numbers, with parentheses)
      const a = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const b = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const c = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const d = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];
      const op3 = operators[Math.floor(Math.random() * operators.length)];

      const expression = `(${a} ${op1} ${b}) ${op2} ${c} ${op3} ${d}`;
      const answer = eval(expression);

      return { expression, answer: Math.round(answer * 100) / 100 };
    } else {
      // Complex: a op (b op c) op d or (a op b) op (c op d)
      const a = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const b = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const c = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const d = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];
      const op3 = operators[Math.floor(Math.random() * operators.length)];

      const useDoubleParens = Math.random() > 0.5;
      const expression = useDoubleParens
        ? `(${a} ${op1} ${b}) ${op2} (${c} ${op3} ${d})`
        : `${a} ${op1} (${b} ${op2} ${c}) ${op3} ${d}`;

      const answer = eval(expression);

      return { expression, answer: Math.round(answer * 100) / 100 };
    }
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

  const handleSubmit = () => {
    if (!currentExercise || userAnswer === "") return;

    const parsedAnswer = parseInt(userAnswer);
    const isAnswerCorrect = parsedAnswer === currentExercise.answer;
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
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("orderOfOperations.inARow")}` : `✅ ${t("orderOfOperations.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("orderOfOperations.notQuite")}`,
        description: `${t("orderOfOperations.answerIs")} ${currentExercise.answer}`,
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
        setIsCorrect(null);
        setUserAnswer("");
      }, 1500);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
        setCurrentExercise(generateExercise(difficulty!));
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
            <Heading textAlign="center" color="orange.600" size="lg">
              {t("orderOfOperations.title")}
            </Heading>
            <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
              Order of Operations
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
                    colorScheme="orange"
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
                    colorScheme="orange"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "orange.50" }}
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
                ← {t("orderOfOperations.back")}
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
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Heading size="2xl" textAlign="center">
              {percentage === 100 ? t("orderOfOperations.perfectScore") : percentage >= 80 ? t("orderOfOperations.greatJob") : percentage >= 60 ? t("orderOfOperations.wellDone") : t("orderOfOperations.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="orange.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("orderOfOperations.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.score")}</Text>
                  <Text color="orange.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.accuracy")}</Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.time")}</Text>
                  <Text color="blue.600">{formatTime(elapsedTime)}</Text>
                </VStack>
              </HStack>

              <Progress
                value={percentage}
                colorScheme={percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red"}
                size="lg"
                borderRadius="full"
                width="100%"
              />
            </VStack>
          </Box>

          <HStack spacing={4} width="100%">
            <Button
              onClick={() => { setMaxExercises(null); setDifficulty(null); }}
              colorScheme="orange"
              size="lg"
              flex={1}
            >
              {t("orderOfOperations.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("orderOfOperations.backToTests")}
            </Button>
          </HStack>

          {/* Show completed exercises */}
          <Box width="100%">
            <Heading size="md" mb={4} color="gray.600">
              {t("orderOfOperations.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
              {completedExercises.map((exercise) => (
                <Box
                  key={exercise.timestamp}
                  p={4}
                  borderRadius="lg"
                  bg={exercise.isCorrect ? "green.50" : "red.50"}
                  borderWidth={2}
                  borderColor={exercise.isCorrect ? "green.200" : "red.200"}
                  opacity={0.7}
                  _hover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <HStack spacing={2} fontSize="lg" fontWeight="bold" flexWrap="wrap">
                      <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                        {exercise.isCorrect ? "✓" : "✗"}
                      </Text>
                      <Text color="gray.700">{exercise.expression}</Text>
                      <Text color="gray.500">=</Text>
                      <Text
                        color={exercise.isCorrect ? "green.600" : "red.600"}
                        textDecoration={exercise.isCorrect ? "none" : "line-through"}
                      >
                        {exercise.userAnswer}
                      </Text>
                      {!exercise.isCorrect && (
                        <Text color="green.600" fontSize="md">
                          (correct: {exercise.answer})
                        </Text>
                      )}
                    </HStack>
                    <Badge colorScheme={exercise.isCorrect ? "green" : "red"}>
                      {exercise.isCorrect ? "Correct" : "Wrong"}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
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
              🔥 {t("orderOfOperations.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="orange.600" size="lg">
            {t("orderOfOperations.title")}
          </Heading>
          <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("orderOfOperations.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("orderOfOperations.score")}: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="orange"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Exercise Card */}
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentExercise.expression}-${totalQuestions}`}
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
                : "orange.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={6}>
              {/* Expression with animation */}
              <HStack spacing={4} fontSize="4xl" fontWeight="bold" flexWrap="wrap" justify="center">
                <MotionBox
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Text color="orange.500">{currentExercise.expression}</Text>
                </MotionBox>

                <Text color="gray.600">=</Text>

                {/* Answer Input */}
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="?"
                  size="md"
                  fontSize="3xl"
                  fontWeight="bold"
                  textAlign="center"
                  width="150px"
                  autoFocus
                  type="number"
                  step="0.01"
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
                colorScheme="orange"
                size="md"
                fontSize="lg"
                px={8}
                py={4}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("orderOfOperations.checkAnswer")}
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
              ? t("orderOfOperations.onFire")
              : streak >= 3
                ? t("orderOfOperations.amazing")
                : t("orderOfOperations.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("orderOfOperations.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch">
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
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4} fontSize="2xl" fontWeight="bold">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="gray.700">{exercise.expression}</Text>
                        <Text color="gray.500">=</Text>
                        <Text
                          color={exercise.isCorrect ? "green.600" : "red.600"}
                          textDecoration={exercise.isCorrect ? "none" : "line-through"}
                        >
                          {exercise.userAnswer}
                        </Text>
                        {!exercise.isCorrect && (
                          <Text color="green.600" fontSize="lg">
                            (correct: {exercise.answer})
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

